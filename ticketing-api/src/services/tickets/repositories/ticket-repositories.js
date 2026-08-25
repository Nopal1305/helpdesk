import { nanoid } from 'nanoid';
import InvariantError from '../../../exceptions/invariant-error.js';
import pool from '../../../api/db.js';

class TicketRepositories {
    constructor() {
        this._pool = pool;
    }

async addTicket({ title, category, priority, description, reporter_id }) {
        const id = `TCK-${nanoid(6).toUpperCase()}`;
        
        const insertQuery = {
            text: `INSERT INTO tickets (ticket_code, title, description, category, priority, reporter_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            values: [id, title, description, category, priority, reporter_id]
        }
        const insertResult = await this._pool.query(insertQuery);
        
        if (!insertResult.rows.length) {
            throw new InvariantError('Gagal membuat tiket laporan IT baru');
        }

        const newTicketId = insertResult.rows[0].id;

        const getQuery = {
            text: `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.id = $1
            `,
            values: [newTicketId]
        }
        const getResult = await this._pool.query(getQuery);
        
        return getResult.rows[0];
    }

    async getTicketsbyReporter(reporter_id) {
        const query = {
            text: `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id 
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.reporter_id = $1 
                ORDER BY t.created_at DESC
            `,
            values: [reporter_id]
        }
        const result = await this._pool.query(query);
        return result.rows;
    }

    async getAllTicket() {
        const query = {
            text: `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                ORDER BY t.created_at DESC
            `,
        }
        const result = await this._pool.query(query)
        return result.rows;
    }

    async updateTicketStatus(id, status, assignee_id, resolution_notes=null) {
        
        const updateQuery = {
            text: `UPDATE tickets SET status = $1, assignee_id = $2, resolution_notes = COALESCE($3, resolution_notes), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id`,
            values: [status, assignee_id, resolution_notes, id]
        }
        const updateResult = await this._pool.query(updateQuery);
        
        if (!updateResult.rows.length) {
            throw new InvariantError('ticket tidak ditemukan');
        }

        const getQuery = {
            text: `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.id = $1
            `,
            values: [id]
        }
        const getResult = await this._pool.query(getQuery);
        
        return getResult.rows[0]; 
    }
}

export default new TicketRepositories();