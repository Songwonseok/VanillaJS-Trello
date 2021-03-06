const NoteModel = require('../models/note.model')
const ColumnsModel = require('../models/columns.model')

class NoteService {
    constructor() {
        this.noteModel = new NoteModel();
        this.columnsModel = new ColumnsModel();
    }

    async findOne(note_id) {
        try {
            const note = await this.noteModel.SELECT(note_id);
            return note;
        } catch (err) {
            throw err;
        }
    }

    async create(noteDTO) {
        try {
            const columns = await this.columnsModel.SELECT(noteDTO.columns_id);
            const insertId = await this.noteModel.INSERT(noteDTO);
            
            if(columns.head == null){
                columns.head = insertId;
                await this.columnsModel.UPDATE(columns);
            }else {
                const last = await this.noteModel.SELECT_LAST(columns.id);
                last.next_note = insertId;
                await this.noteModel.UPDATE_NODE(last);
            }
            noteDTO.id = insertId;
            noteDTO.to_column = columns.name;
            return noteDTO;
        } catch (err) {
            throw err;
        }
    }

    async update(noteDTO) {
        try {
            const origin = await this.noteModel.SELECT(noteDTO.id);
            await this.noteModel.UPDATE(noteDTO);
            noteDTO.subject = `${ origin.content } -> ${ noteDTO.content }`;
            return noteDTO;
        } catch (err) {
            throw err;
        }
    }

    // columns_id: 내가 옮긴 columns의 id
    async move(noteDTO) {
        try {
            const currColumns = await this.columnsModel.SELECT(noteDTO.columns_id);
            const origin = await this.noteModel.SELECT(noteDTO.id);
            const originColumns = await this.columnsModel.SELECT(origin.columns_id);
            
            if (currColumns.id == originColumns.id && noteDTO.next_note == origin.next_note)
                return null;

            // 1. next_note가 있을 때
            if(noteDTO.next_note){
                const next = await this.noteModel.SELECT(noteDTO.next_note);
                // note의 위치가 top인지 확인
                if (currColumns.head == next.id) {
                    currColumns.head = noteDTO.id;
                    await this.updatePrev(origin, originColumns)
                    await this.columnsModel.UPDATE(currColumns);
                } else {
                    const next_prev = await this.noteModel.SELECT_PREV(next.id);
                    next_prev.next_note = noteDTO.id;
                    await this.updatePrev(origin, originColumns)
                    await this.noteModel.UPDATE_NODE(next_prev);
                }
            }
            // 2. next_note가 없을 때
            else {
                // 현재 columns의 가장 마지막 note를 가져옴
                const last = await this.noteModel.SELECT_LAST(currColumns.id);
                
                // last가 존재하면 bottom, 없으면 top
                if (last) {
                    last.next_note = noteDTO.id;
                    await this.updatePrev(origin, originColumns)
                    await this.noteModel.UPDATE_NODE(last);
                }else {
                    currColumns.head = noteDTO.id;
                    await this.columnsModel.UPDATE(currColumns);
                    await this.updatePrev(origin, originColumns)
                }
            }

            //내꺼 수정
            await this.noteModel.UPDATE_NODE(noteDTO);

            noteDTO.subject = origin.content;
            noteDTO.to_column = currColumns.name;
            noteDTO.from_column = originColumns.name;
            return noteDTO;
        } catch (err) {
            throw err;
        }
    }

    async updatePrev(origin, originColumns) {
        const prev = await this.noteModel.SELECT_PREV(origin.id);
        if (prev) {
            prev.next_note = origin.next_note;
            await this.noteModel.UPDATE_NODE(prev);
        } else {
            originColumns.head = origin.next_note;
            await this.columnsModel.UPDATE(originColumns);
        }
    }

    async delete(note_id) {
        try {
            const note = await this.noteModel.SELECT(note_id);
            const columns = await this.columnsModel.SELECT(note.columns_id);
            
            if (columns.head == note_id) {
                columns.head = note.next_note;
                await this.columnsModel.UPDATE(columns);
            } else {
                const prev = await this.noteModel.SELECT_PREV(note_id);
                prev.next_note = note.next_note;
                await this.noteModel.UPDATE_NODE(prev);
            }
            await this.noteModel.DELETE(note_id);

            const logData = {
                subject: note.content,
                from_column: columns.name
            }
            return logData;
        } catch (err) {
            throw err;
        }
    }

}



module.exports = NoteService;