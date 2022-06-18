//create a new route for playlist/[id]
import prisma from '../../lib/prisma'
import { validateToken } from '../../lib/auth'
import GradientLayout from '../../components/gradientLayout'
import SongTable from '../../components/songsTable'

const getBGColor = (id) => {
	const colors = [
		'red',
		'green',
		'blue',
		'orange',
		'purple',
		'gray',
		'teal',
		'yellow'
	]

	return colors[id - 1] || colors[Math.floor(Math.random() * colors.length)]
}

const Playlist = ({ playlist }) => {
	const color = getBGColor(playlist.id)
	return (
		<GradientLayout 
			color={color}
			roundImage={false}
			title={playlist.name}
			subtitle="playlist"
			description={`${playlist.songs.length} songs`}
			image={`https://picsum.photos/400?random=${playlist.id}`}
		>
			<SongTable songs={playlist.songs}/>
		</GradientLayout>
	)
}

export const getServerSideProps = async ({ query, req }) => {
	let user
	try {
		user = validateToken(req.cookies.TRAX_ACCESS_TOKEN)
	} catch (e) {
		return {
			redirect: {
				permanent: false,
				destination: '/signin'
			}
		}
	}
	const [playlist] = await prisma.playlist.findMany({
		where: {
			id: +query.id, // + converts string to number
			userId: user.id
		},
		include: { // include is a sql join
			songs: {
				include: {
					artist: {
						select: {
							name: true, // select name and id of artists
							id: true
						}
					}
				}
			}
		}
	})

	return {
		props: { playlist } 
	}
}
export default Playlist
