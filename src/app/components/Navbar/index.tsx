import { logout } from "@/api/auth"
import { cookies } from "next/headers"
import { redirect } from 'next/navigation'  // 상단에 추가

interface NavbarProps {
    cookieString?: string | null
}
export default async function Navbar({ cookieString }: NavbarProps) {
    const handleLogout = async () => {
        'use server'
        if (!cookieString) {
            return
        }
        const result = await logout(cookieString)
        if (!result) {
            return
        }

        // 단일 쿠키 삭제 예시
        // (await cookies()).delete('session_id');
        // (await cookies()).delete('fakesession');


        const cookieStore = cookies()
            ; (await cookieStore).getAll().forEach(async cookie => {
                console.log("cookie: ", cookie)
                return (await cookieStore).delete(cookie.name)
            })
        // redirect('/login')
    }


    const handleClickLogo = async () => {
        'use server'
        redirect('/')
    }

    const handleClickHistory = async () => {
        'use server'
        redirect('/history')
    }



    return (
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <a
                    onClick={handleClickLogo}
                    className="btn btn-ghost text-xl">firoUI</a>
            </div>
            <div className="flex-none">

                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="Tailwind CSS Navbar component"
                                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                        <li>
                            <a
                                onClick={handleClickHistory}
                                className="justify-between">
                                History
                                {/* <span className="badge">New</span> */}
                            </a>
                        </li>
                        {/* <li><a>Settings</a></li> */}
                        <li><a onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}


