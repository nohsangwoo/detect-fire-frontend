'use client';

import useLogin from '@/hooks/useLogin';
import useSignUp from '@/hooks/useSignUp';
import useMe from '@/hooks/useMe';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [signupCode, setSignupCode] = useState('');

    const [password, setPassword] = useState('');
    const router = useRouter();
    const meQuery = useMe()

    const [isSignupProcessing, setIsSignupProcessing] = useState(false)

    const handleLoginMutationSuccess = () => {
        meQuery.refetch()
        setIsLogin(true)
        router.push('/')
    }
    const loginMutation = useLogin({ onSuccessFunction: handleLoginMutationSuccess });

    const handleSignupMutationSuccess = () => {
        setIsLogin(false)
        setIsSignupProcessing(true)
    }
    const signUpMutation = useSignUp({ onSuccessFunction: handleSignupMutationSuccess });

    const toggleMode = () => {
        setIsLogin(!isLogin);
    };

    const handleLogin = async () => {
        loginMutation.mutate({ username: email, password })

    }

    const handleSignup = async () => {
        signUpMutation.mutate({ email, password });
        setIsLogin(true);

    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLogin) {
            await handleLogin();
        } else {
            await handleSignup();
        }
    };


    useEffect(() => {
        if (meQuery.data) {
            console.log('로그인중:', meQuery.data)
            router.push('/')
        }
    }, [meQuery.data])

    if (!!meQuery?.data) {
        return <div>페이지 이동중...</div>
    }

    if (meQuery.isLoading || meQuery.isFetching) {
        return <div>Loading...</div>
    }


    return (
        <div className="w-full h-screen bg-black-1 flex justify-center items-center">
            <div className="flex flex-col justify-center items-center w-[700px] h-[700px] rounded-full bg-transparent border-[3px] border-celadon relative">
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
                {isSignupProcessing ? (
                    <form onSubmit={handleSubmit} className="text-celadon text-2xl font-bold flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="승인번호6자리"
                            className="w-[300px] h-[50px] rounded-full bg-transparent border-[2px] border-celadon px-4 ring-0 focus:ring-0 focus:outline-none"
                            value={signupCode}
                            onChange={(e) => setSignupCode(e.target.value)}
                            autoComplete="current-password"
                        />
                        <button
                            type="submit"
                            className="w-[300px] h-[50px] rounded-full border-[3px] border-celadon text-black-1 flex justify-center items-center text-white text-xl font-extrabold cursor-pointer"
                        >
                            승인번호 입력
                        </button>
                        <div className="text-sm">email을 확인하여 승인번호를 입력해주세요</div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="text-celadon text-2xl font-bold flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="email"
                            className="w-[300px] h-[50px] rounded-full bg-transparent border-[2px] border-celadon px-4 ring-0 focus:ring-0 focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="current-password"
                        />
                        <input
                            type="password"
                            placeholder="password"
                            className="w-[300px] h-[50px] rounded-full bg-transparent border-[2px] border-celadon px-4 ring-0 focus:ring-0 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                        <button
                            type="submit"
                            className="w-[300px] h-[50px] rounded-full border-[3px] border-celadon text-black-1 flex justify-center items-center text-white text-xl font-extrabold cursor-pointer"
                        >
                            {isLogin ? 'login' : 'signup'}
                        </button>
                    </form>
                )}

                <div className="flex absolute right-0 bottom-0 w-full justify-end">
                    <div className="flex flex-col justify-end ">
                        <div className="flex justify-end">
                            <div className="text-sm cursor-pointer text-perano" onClick={toggleMode}>
                                {isLogin ? 'signup' : 'login'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
