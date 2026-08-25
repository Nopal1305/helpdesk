import pool from "../../../api/db.js";
import InvariantError from "../../../exceptions/invariant-error.js";

class AuthRepositories {
    constructor() {
        this._pool = pool;
    }

    async addUser({ fullName, email, password, role, department }) {
        const query = {
            text: `INSERT INTO users (full_name, email, password, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role, department`,
            values: [fullName, email, password, role, department]
        }
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Gagal menambahkan akun baru');
        }
        return result.rows[0];
    }

    async getUserbyEmail(email) {
        const query = {
            text: `SELECT * FROM users WHERE email = $1`,
            values: [email]
        }
        const result = await this._pool.query(query)
        return result.rows.length ? result.rows[0] : null;
    }

    async addRefreshToken(token) {
        const query = {
            text: `INSERT INTO authentications (token) VALUES ($1)`,
            values: [token]
        }
        await this._pool.query(query)
    }

    async checkRefreshToken(token) {
        const query = {
            text: `SELECT token FROM authentications WHERE token = $1`,
            values: [token]
        }
        const result = await this._pool.query(query)
        if (!result.rows.length) {
            throw new InvariantError('Token tidak ditemukan')
        }
    }

    async deleteRefreshToken(token) {
        const query = {
            text: `DELETE FROM authentications WHERE token = $1`,
            values: [token]
        }
        await this._pool.query(query);
    }


}

export default new AuthRepositories();