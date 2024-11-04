'use client'

import { getHistory } from "@/api/detection_log";
import { Pagination, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import connectToCloudFrontURL from "@/lib/connectToCloudFrontURL";

interface MainHistoryPageProps {
    cookieString: string
}

interface Detection {
    class_name: string;
    confidence: number;
    bbox: number[];
}

export default function MainHistoryPage({ cookieString }: MainHistoryPageProps) {
    const [page, setPage] = useState(1);
    const pageSize = 10
    const [expandedItems, setExpandedItems] = useState<number[]>([]);

    const { data: historyData } = useQuery({
        queryKey: ['history', page, pageSize],
        queryFn: () => getHistory({ page, pageSize }),
    });

    console.log("historyData in HistoryPage: ", historyData)

    const handlePageChange = (event: ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const toggleExpand = (id: number) => {
        setExpandedItems(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const formatConfidence = (confidence: number) => {
        return (confidence * 100).toFixed(1) + '%';
    };

    const totalLogsCount = historyData?.total_count
    const pageCount = Math.ceil(totalLogsCount / pageSize)

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-lg mx-auto px-4 py-6"
        >
            <AnimatePresence mode="wait">
                <div className="space-y-4 pb-24">
                    {historyData?.items.map((item: any, index: number) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#1C1C1E] rounded-xl p-4 shadow-lg backdrop-blur-lg
                                     border border-[#38383A] hover:border-[#48484A] transition-all"
                        >
                            <motion.div 
                                className="cursor-pointer"
                                onClick={() => toggleExpand(item.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-3 py-1 rounded-full text-sm
                                                ${item.has_fire 
                                                    ? 'bg-red-500/20 text-red-400' 
                                                    : 'bg-green-500/20 text-green-400'}`}>
                                                {item.has_fire ? '화재 감지' : '안전'}
                                            </span>
                                            <span className="text-[#8E8E93] text-sm">
                                                {format(new Date(item.created_at), 'PPP p', { locale: ko })}
                                            </span>
                                        </div>
                                        <p className="text-white/90">{item.message}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {item.result_image && (
                                            <motion.img
                                                whileHover={{ scale: 1.05 }}
                                                src={connectToCloudFrontURL(item.result_image)}
                                                alt="감지 이미지"
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                        )}
                                        {item.detections?.length > 0 && (
                                            <motion.div
                                                animate={{ rotate: expandedItems.includes(item.id) ? 180 : 0 }}
                                                className="text-[#8E8E93]"
                                            >
                                                <ChevronDownIcon className="w-5 h-5" />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* 확장된 상세 정보 */}
                            <AnimatePresence>
                                {expandedItems.includes(item.id) && item.detections?.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-4 pt-4 border-t border-[#38383A]"
                                    >
                                        <div className="space-y-3">
                                            {item.detections.map((detection: Detection, idx: number) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="bg-[#2C2C2E] rounded-lg p-3 space-y-2"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white/90 font-medium">
                                                            {detection.class_name}
                                                        </span>
                                                        <span className="text-[#0A84FF] text-sm">
                                                            {formatConfidence(detection.confidence)}
                                                        </span>
                                                    </div>
                                                    <div className="text-[#8E8E93] text-sm">
                                                        위치: {detection.bbox.map(n => n.toFixed(1)).join(', ')}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-6 left-0 right-0 flex justify-center"
            >
                <div className="bg-[#1C1C1E]/80 backdrop-blur-lg px-6 py-3 rounded-full
                               border border-[#38383A] shadow-xl">
                    <Stack spacing={2}>
                        <Pagination 
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    color: '#FFFFFF',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: '#0A84FF',
                                    },
                                },
                            }}
                            page={page}
                            count={pageCount === 0 ? 1 : pageCount}
                            boundaryCount={1}
                            siblingCount={1}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Stack>
                </div>
            </motion.div>
        </motion.div>
    )
}