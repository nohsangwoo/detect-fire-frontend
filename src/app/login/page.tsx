'use client';

export default function Login() {

    return (
        <div className="w-full h-screen bg-black-1 flex justify-center items-center">
            <div className="flex justify-center items-center w-[700px] h-[700px] rounded-full bg-transparent border border-celadon relative">
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
                <div className="text-celadon text-2xl font-bold flex flex-col gap-4">
                    <input type="text" placeholder="username" className="w-[300px] h-[50px] rounded-full bg-transparent border-[3px] border-celadon px-4 ring-0 focus:ring-0 focus:outline-none" />
                    <input type="password" placeholder="password" className="w-[300px] h-[50px] rounded-full bg-transparent border-[3px] border-celadon px-4 ring-0 focus:ring-0 focus:outline-none" />
                    <div className="w-[300px] h-[50px] rounded-full border-[3px] border-celadon text-black-1 flex justify-center items-center text-white text-xl font-extrabold cursor-pointer">
                        login
                    </div>
                </div>

            </div>
        </div>
    );
}
