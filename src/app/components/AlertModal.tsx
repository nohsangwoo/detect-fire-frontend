'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IoWarningOutline } from "react-icons/io5";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AlertModal({ isOpen, onClose }: AlertModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md rounded-2xl bg-white/80 dark:bg-[#1c1c1e]/90 backdrop-blur-xl 
                                 shadow-2xl overflow-hidden animate-fire-alert-border-pulse"
                    >
                        <div className="p-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className="flex justify-center mb-6"
                            >
                                <IoWarningOutline className="w-16 h-16 text-red-500 animate-pulse" />
                            </motion.div>

                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-xl font-bold text-center mb-4 dark:text-white"
                            >
                                화재가 감지되었습니다
                            </motion.h2>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-center text-gray-600 dark:text-gray-300 mb-6"
                            >
                                주요 담당자 및 근무자에게 감지된 내용을 SMS로 전달합니다
                            </motion.p>

                            <motion.button
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                onClick={onClose}
                                className="w-full py-3 px-4 rounded-xl bg-red-500 text-white font-medium
                                         transition-all hover:bg-red-600 active:scale-95"
                            >
                                확인
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 