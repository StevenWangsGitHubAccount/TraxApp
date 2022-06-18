import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { artistsData } from './songsData'

const prisma = new PrismaClient() // prisma instance handles database

const run = async () => {
	await Promise.all(artistsData.map(async (artist) => {
			// upsert updates if the database entry exists; otherwise it creates it
			return prisma.artist.upsert({
				where: { name: artist.name },
				update: {}, // don't update if an artist with this name is found
				create: { // if artist isn't found, create one
					name: artist.name,
					songs: {
						// nested insert -- if an artist is created, also create songs
						create: artist.songs.map(song => ({
							name: song.name,
							duration: song.duration,
							url: song.url
						}))
					}
				}
			})
		})
	)

	const salt = bcrypt.genSaltSync()
	const user = await prisma.user.upsert({
		where: { email: 'user@test.com' },
		update: {},
		create: {
			email: 'user@test.com',
			password: bcrypt.hashSync('password', salt),
			firstName: 'Steve',
			lastName: 'Wang'
		}
	})

	const songs = await prisma.song.findMany({})
	await Promise.all(new Array(10).fill(1).map(async (_, i) => {
		return prisma.playlist.create({
			data: {
				name: `Playlist #${i + 1}`,
				user: {
					connect: { id: user.id }
				},
				songs: {
					connect: songs.map((song) => ({
						id: song.id
					}))
				}
			}
		})
	}))
}

run()
.catch((e) => {
	console.error(e)
	process.exit(1)
})
.finally(async () => {
	await prisma.$disconnect()
})
