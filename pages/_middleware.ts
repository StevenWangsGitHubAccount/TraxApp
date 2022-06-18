import { NextResponse } from 'next/server'

const signedInPages = ['/', '/playlist', '/library']
// if user attempts to visit a signedInPage without being signed in (i.e., no token),
// they will be redirected to the sign-in page

export default function middleware(req) {
	if (signedInPages.find((p) => p === req.nextUrl.pathname)) {
		const token = req.cookies.TRAX_ACCESS_TOKEN

		if (!token) {
			return NextResponse.redirect('/signin')
		}
	}	
}
