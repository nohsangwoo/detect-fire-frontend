
'use client'

import { getHistory } from "@/api/detection_log";
import { Pagination, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";

interface MainHistoryPageProps {
    cookieString: string
}
export default function MainHistoryPage({ cookieString }: MainHistoryPageProps) {
    const [page, setPage] = useState(1);
    const pageSize = 10

    const { data: historyData } = useQuery({
        queryKey: ['history', page, pageSize],
        queryFn: () => getHistory({ page, pageSize }),
    });

    console.log("historyData in HistoryPage: ", historyData)

    const handlePageChange = (event: ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };


    const totalLogsCount = historyData?.total_count
    const pageCount = Math.ceil(totalLogsCount / pageSize)

    return (
        <div>
            MainHistoryPage
            <div className="flex justify-center items-center h-[71px] w-full bg-customDarkDark rounded-b-[10px]">
                <Stack spacing={2}>
                    <Pagination sx={{ color: "white" }} page={page} count={pageCount === 0 ? 1 : pageCount} boundaryCount={1} siblingCount={1} onChange={handlePageChange} color="primary" showFirstButton showLastButton />
                </Stack>
            </div>
        </div>
    )
}