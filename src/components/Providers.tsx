'use client'

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ToastContainer />
        </QueryClientProvider>
    )
}
