'use client'

import useApproval from "@/hooks/useApproval";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ApprovalProps {
    email: string
}
const Approval = ({ email }: ApprovalProps) => {
    const [signupCode, setSignupCode] = useState('');
    const router = useRouter()

    const approvalMutation = useApproval({})

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        approvalMutation.mutate({ email: email, validation_number: signupCode })
        router.push('/')
    };
    return (
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
    );
};

export default Approval;
