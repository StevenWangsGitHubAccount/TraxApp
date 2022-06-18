import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import prisma from '../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const salt = bcrypt.genSaltSync()
	const { email, password } = req.body

	let user

	// create user with email and hashed password
	try {
		user = await prisma.user.create({
			data: {
				email,
				password: bcrypt.hashSync(password, salt)
			}
		})
	} catch (e) {
		res.status(401)
		res.json({ error: 'User already exists' })
		return
	}

	// if user was successfully created, create a JSON web token
	// token is a string created with these arguments
	const token = jwt.sign({
		email: user.email,
		id: user.id,
		time: Date.now(),
	},
	'hello', // secret
	{ expiresIn: '8h' }
	)

	// token is serialized in a cookie
	res.setHeader(
		'Set-Cookie',
		cookie.serialize('TRAX_ACCESS_TOKEN', token, {
			httpOnly: true,
			maxAge: 8 * 60 * 60,
			path: '/',
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production'
		})
	)

	// send back user object
	res.json(user)

}
