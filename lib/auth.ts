import jwt from 'jsonwebtoken'
import prisma from './prisma'

// function to wrap handler
// handler is a function

// retrieve token
// if there is a token, then try to get the user
// if there is a valid user, call the handler function with req, res, and user arguments
// otherwise, catch the error
// also, set response to error if there is no token

export const validateRoute = (handler) => {
	return async (req: NextApiRequest, res: NextApiResponse) => {
		const token = req.cookies.TRAX_ACCESS_TOKEN

		if (token) {
			let user

			try {
				const { id } = jwt.verify(token, 'hello') // hello was the secret
				user = await prisma.user.findUnique({
					where: { id }
				})

				if (!user) {
					throw new Error('Not real user')
				}
			} catch (error) {
				res.status(401)
				res.json({ error: 'Not authorized'})
				return 
			}
			
			return handler(req, res, user)
		}

		res.status(401)
		res.json({ error: 'Not authorized'})
	}	
}

export const validateToken = (token) => {
	const user = jwt.verify(token, 'hello')
	return user
}
