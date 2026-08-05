const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
const path = require('path')

// Load the .env stored in the project root, regardless of where Node was started.
// `server.js` is in <project>/server, so the project root is one directory up.
const possibleEnvPaths = [path.resolve(__dirname, '../.env'), path.resolve(process.cwd(), '.env')]
let dotenvResult = null
for (const p of possibleEnvPaths) {
	dotenvResult = dotenv.config({ override: true, path: p })
	if (!dotenvResult.error) {
		console.log('.env loaded from', p)
		break
	}
}
if (!dotenvResult || dotenvResult.error) {
	console.warn('No .env loaded or parse error:', dotenvResult && dotenvResult.error)
}

const app = express()
const port = process.env.PORT || 3005

const dbHost = process.env.DB_HOST
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD
const dbName = process.env.DB_NAME
const dbPort = Number(process.env.DB_PORT || 3307)

console.log(`DB config: host=${dbHost || '<unset>'} port=${dbPort} user=${dbUser || '<unset>'}`)

const db = mysql.createPool({
	host: dbHost,
	user: dbUser,
	password: dbPassword,
	database: dbName,
	port: dbPort,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
	res.json({ status: 'ok', now: new Date().toISOString() })
})

app.get('/targonca', async (req, res) => {
	try {
		const [rows] = await db.query('SELECT nev, tomeg, RFID FROM targonca')
		res.json(rows)
	} catch (error) {
		console.error('Error fetching targonca data:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.get('/gongyoleg', async (req, res) => {
	try {
		const [rows] = await db.query('SELECT id, nev FROM gongyoleg');
		res.json(rows);
	} catch (error) {
		console.error('Error fetching gongyoleg data:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.post('/cimkek', async (req, res) => {
	const { pairing_id: pairingId, lf_id: lfId, RFID, vkod } = req.body

	if (!pairingId || !lfId || !RFID || !vkod) {
		return res.status(400).json({ error: 'pairing_id, lf_id, RFID, and vkod are required' })
	}

	let connection
	try {
		connection = await db.getConnection()
		await connection.beginTransaction()

		const [labelResult] = await connection.query(
			'UPDATE kinyom_cimkek SET lf_id = ?, g_id = ?, RFID = ? WHERE vkod = ?',
			[lfId, 1, RFID, vkod]
		)

		if (labelResult.affectedRows !== 1) {
			throw new Error(`No cimke found for vkod ${vkod}`)
		}

		// Both RFID values must match the inactive pairing created by the first form.
		

		

		await connection.commit()
		res.json({ success: true, id: Number(pairingId), aktiv: 1 })
	} catch (error) {
		if (connection) {
        	await connection.rollback();
    	}

   		 console.error("Error updating cimke:", error);

    	res.status(500).json({
        	success: false,
        	error: error.message,
    	});
	} finally {
		if (connection) connection.release()
	}
});
app.post('/targonca_update', async (req, res) => {
	const { nev, tomeg, RFID } = req.body

	if ( !nev || !tomeg || !RFID) {
		return res.status(400).json({ error: 'All fields are required' })
	}

	try {
		const [result] = await db.query(
			'UPDATE targonca SET tomeg = ?, RFID = ? WHERE nev = ?',
			[ tomeg, RFID, nev]
		)
		res.json({ success: true, affectedRows: result.affectedRows })
	} catch (error) {
		console.error('Error updating targonca data:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
});

app.post('/gongyolegek', async (req, res) => {
	const { lf_id: lfId, RFID } = req.body

	if ( !lfId || !RFID) {
		return res.status(400).json({ error: ' lf_id and RFID are required' })
	}

	try {
		// First form: save the selected gongyoleg and both RFID values as active.
		const [result] = await db.query(
			'INSERT INTO gongyolegek (g_id, lf_id, RFID, aktiv) VALUES (?, ?, ?, ?)',
			[1, lfId, RFID, 1]
		)
		res.status(201).json({ success: true, id: result.insertId, g_id: 1, aktiv: 1 })
	} catch (error) {
		console.error('Error creating active gongyoleg record:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
});

app.get('/raktar', async (req, res) => {
	try {
		const [rows] = await db.query('SELECT id, nev FROM raktar')
		res.json(rows)
	} catch (error) {
		console.error('Error fetching raktar data:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
});
app.post('/mozgasok', async (req, res) => {
	const { raktar_id, tomeg, sor, oszlop, melyseg, irany, rfid } = req.body
	let pa_id;
	if (!raktar_id || !tomeg || !rfid) {
		return res.status(400).json({ error: 'raktar_id, tomeg, and rfid are required' })
	}
	try {
		[pa_id] = await db.query(
			'SELECT pa_id FROM par_nezet WHERE lf_id = ?',
			[rfid]
		)
		if (!pa_id || pa_id.length === 0) {
			return res.status(400).json({ error: 'Invalid rfid, no matching par_nezet entry' })
		}
		pa_id = pa_id[0].pa_id
	} catch (error) {
		console.error('Error fetching pa_id for rfid:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
	try {		
			const [result] = await db.query(
			'INSERT INTO mozgasok (pa_id, r_id, tomeg, x, y, z, irany, idopont) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
			[pa_id, raktar_id, tomeg, sor, oszlop, melyseg, irany]
		)
		res.json({ success: true, id: result.insertId })
	} catch (error) {
		console.error('Error inserting mozgas:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
});

app.post('/rfid_barcode', async (req, res) => {
	const rfid = req.body.rfid || req.body.RFID || req.body.lf_id
	const barcode = req.body.barcode || req.body.vkod

	if (!rfid || !barcode) {
		return res.status(400).json({ error: 'Both rfid and barcode are required' })
	}

	try {
		// 1. Find the RFID's pair/counterpart from the gongyolegek table
		const [gongyolegekRows] = await db.query(
			'SELECT lf_id, RFID FROM gongyolegek WHERE lf_id = ? OR RFID = ? LIMIT 1',
			[rfid, rfid]
		)

		if (gongyolegekRows.length === 0) {
			return res.status(404).json({ error: 'A megadott RFID nem található egyetlen göngyöleg párosításban sem.' })
		}

		const lfId = gongyolegekRows[0].lf_id
		const hfId = gongyolegekRows[0].RFID

		// 2. Update kinyom_cimkek to pair both RFIDs with the barcode (vkod) by updating the vkod where both RFIDs match
		const [result] = await db.query(
			'UPDATE kinyom_cimkek SET vkod = ? WHERE lf_id = ? AND RFID = ?',
			[barcode, lfId, hfId]
		)

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: 'Nem található címke a megadott RFID pároshoz.' })
		}

		res.json({
			success: true,
			message: 'Barcode (vkod) updated successfully for the RFID pair',
			lf_id: lfId,
			RFID: hfId,
			vkod: barcode,
			affectedRows: result.affectedRows
		})
	} catch (error) {
		console.error('Error pairing RFID with barcode:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
});

app.post('/repair_gongyoleg', async (req, res) => {
	const rfid1 = req.body.rfid1 || req.body.lf_id
	const rfid2 = req.body.rfid2 || req.body.RFID

	if (!rfid1 || !rfid2) {
		return res.status(400).json({ error: 'Both rfid1 and rfid2 are required' })
	}

	let connection
	try {
		connection = await db.getConnection()
		await connection.beginTransaction()

		// 1. Find the existing container pairing that matches either of the RFIDs
		const [rows] = await connection.query(
			'SELECT id, lf_id, RFID FROM gongyolegek WHERE lf_id IN (?, ?) OR RFID IN (?, ?) LIMIT 1',
			[rfid1, rfid2, rfid1, rfid2]
		)

		if (rows.length === 0) {
			// If neither RFID exists in the database, insert a new pairing (without barcode)
			const [insertResult] = await connection.query(
				'INSERT INTO gongyolegek (g_id, lf_id, RFID, aktiv) VALUES (?, ?, ?, ?)',
				[1, rfid1, rfid2, 1]
			)

			await connection.commit()

			return res.json({
				success: true,
				message: 'Új göngyöleg RFID párosítás sikeresen létrehozva (új párosításként).',
				pairing_id: insertResult.insertId,
				new_lf_id: rfid1,
				new_RFID: rfid2,
				is_new: true
			})
		}

		const pairingId = rows[0].id
		const oldLfId = rows[0].lf_id
		const oldRFID = rows[0].RFID

		// 2. Update the pairing in the gongyolegek table with the new set of RFIDs
		await connection.query(
			'UPDATE gongyolegek SET lf_id = ?, RFID = ? WHERE id = ?',
			[rfid1, rfid2, pairingId]
		)

		// 3. Keep kinyom_cimkek in sync by updating the barcode pairing if it exists
		await connection.query(
			'UPDATE kinyom_cimkek SET lf_id = ?, RFID = ? WHERE lf_id = ? OR RFID = ?',
			[rfid1, rfid2, oldLfId, oldRFID]
		)

		await connection.commit()

		res.json({
			success: true,
			message: 'Göngyöleg RFID párosítás sikeresen frissítve (javítva).',
			pairing_id: pairingId,
			old_lf_id: oldLfId,
			old_RFID: oldRFID,
			new_lf_id: rfid1,
			new_RFID: rfid2
		})
	} catch (error) {
		if (connection) {
			await connection.rollback()
		}
		console.error('Error repairing/updating gongyoleg pairing:', error)
		res.status(500).json({ error: 'Internal server error' })
	} finally {
		if (connection) connection.release()
	}
});

// Debug helper: list registered routes
app.get('/__routes', (req, res) => {
	try {
		const routes = app._router.stack
			.filter((r) => r.route && r.route.path)
			.map((r) => ({ path: r.route.path, methods: r.route.methods }));
		res.json(routes);
	} catch (e) {
		res.status(500).json({ error: String(e) });
	}
});

app.listen(port, () => console.log(`Server running on port ${port}`))

module.exports = app
