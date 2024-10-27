'use client';

import { useSignUp } from '@/hooks/useSignUp';
import { useState } from 'react';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const signUpMutation = useSignUp();

    console.log("isLogin: ", isLogin);

    const toggleMode = () => {
        setIsLogin(!isLogin);
    };

    const handleLogin = () => {
        console.log('login');
    };

    const handleSignup = async () => {
        try {
            signUpMutation.mutate({ email, password });
            console.log('회원가입 성공');
            // 회원가입 성공 후 처리 (예: 로그인 모드로 전환)
            setIsLogin(true);
        } catch (error) {
            console.error('회원가입 실패:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLogin) {
            handleLogin();
        } else {
            await handleSignup();
        }
    };

    return (
        <div className="w-full h-screen bg-black-1 flex justify-center items-center">
            <div className="flex justify-center items-center w-[700px] h-[700px] rounded-full bg-transparent border-[3px] border-celadon relative">
                <div className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 flex justify-center items-center">
                    <div>
                        <svg width="100" height="100" viewBox="0 0 100 100" className="fill-celadon">
                            <path d="M10 0 A10 10 0 0 1 20 0 L80 0 A10 10 0 0 1 90 10 L100 70 A10 10 0 0 1 90 80 L10 90 A10 10 0 0 1 0 80 Z" />
                        </svg>
                        <div className=" bg-celadon w-[100px] h-[100px] rounded-full"></div>
                    </div>
                    <div>
                        <div className=" bg-celadon w-[100px] h-[100px] rounded-full"></div>
                        <div className=" bg-celadon w-[100px] h-[100px] rounded-full"></div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="text-celadon text-2xl font-bold flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="email"
                        className="w-[300px] h-[50px] rounded-full bg-transparent border-[2px] border-celadon px-4 ring-0 focus:ring-0 focus:outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="password"
                        className="w-[300px] h-[50px] rounded-full bg-transparent border-[2px] border-celadon px-4 ring-0 focus:ring-0 focus:outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-[300px] h-[50px] rounded-full border-[3px] border-celadon text-black-1 flex justify-center items-center text-white text-xl font-extrabold cursor-pointer"
                    >
                        {isLogin ? 'login' : 'signup'}
                    </button>
                    <div className="flex absolute right-0 bottom-0 w-full justify-end">
                        <div className="flex flex-col justify-end ">
                            <div className="flex justify-end">
                                <div className="text-sm cursor-pointer text-perano" onClick={toggleMode}>
                                    {isLogin ? 'signup' : 'login'}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
