'use client';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useLogout } from '@/hooks/useLogout';
import { useRouter } from 'next/navigation';


const REQUEST_INTERVAL = 1000; // 1초마다 요청 (밀리초 단위)

interface Detection {
    class_name: string;
    confidence: number;
    bbox: number[];
}

interface ImageProcessingResponse {
    message: string;
    file_name: string;
    detections: Detection[];
    result_image: string;
}


interface MainHomePageProps {
    userSession?: any
}
export default function MainHomePage({ userSession }: MainHomePageProps) {

    const [isDetecting, setIsDetecting] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [detectionResults, setDetectionResults] = useState<ImageProcessingResponse[]>([]);
    const logoutMutation = useLogout();
    const router = useRouter()
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);


    const processFrame = async () => {
        if (!videoRef.current) return null;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/jpeg');
        });
    };

    const { mutate, isPending, error } = useMutation({
        mutationFn: async () => {
            const frame = await processFrame();
            if (!frame) return null;

            const formData = new FormData();
            formData.append('file', frame, 'frame.jpg');

            const response = await axios.post<ImageProcessingResponse>(
                `${process.env.NEXT_PUBLIC_API_URL}/detectfromimage`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            return response.data;
        },
        onSuccess: (data) => {
            if (data) {
                setDetectionResults(prev => [...prev, data]);
                console.log("새로운 감지 결과:", data);
            }
        },
        onError: (error) => {
            console.error("요청 처리 중 오류 발생:", error);
        },
    });

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isDetecting) {
            intervalId = setInterval(() => {
                mutate();
            }, REQUEST_INTERVAL);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isDetecting, mutate]);

    const handleStartDetection = () => {
        setIsDetecting(true);
    };

    const handleStopDetection = () => {
        setIsDetecting(false);
    };

    const handleLogout = () => {
        router.push('/login')
        logoutMutation.mutate()
    }

    useEffect(() => {
        async function getDevices() {
            try {
                // 먼저 카메라 권한 요청
                await navigator.mediaDevices.getUserMedia({ video: true });

                // 권한 획득 후 장치 목록 가져오기
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setDevices(videoDevices);
            } catch (error) {
                console.error("디바이스 목록 가져오기 오류:", error);
            }
        }

        getDevices();
    }, []);

    useEffect(() => {
        async function setupCamera() {
            if (!selectedDeviceId) return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: selectedDeviceId }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("카메라 접근 오류:", error);
            }
        }

        setupCamera();
    }, [selectedDeviceId]);




    // 스타일 상수 추가
    const IOS_STYLES = {
        container: "flex flex-col bg-[#f5f5f7] dark:bg-[#1d1d1f] items-center justify-items-center min-h-screen px-4 md:px-8",
        select: "appearance-none bg-white/70 dark:bg-[#2c2c2e]/70 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs",
        videoContainer: "w-full max-w-4xl rounded-2xl overflow-hidden shadow-lg bg-white/70 dark:bg-[#2c2c2e]/70 backdrop-blur-md min-h-[300px]",
        button: {
            start: "px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg active:scale-95",
            stop: "px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
        },
        resultsContainer: "w-full max-w-4xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-[#2c2c2e]/70 backdrop-blur-md overflow-y-auto p-4 mt-4"
    };

    return (
        <div className={IOS_STYLES.container}>
            <div className='h-10'></div>

            {devices.length > 0 && (
                <select
                    className={IOS_STYLES.select}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}>
                    <option value="">카메라를 선택하세요</option>
                    {devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `카메라 ${device.deviceId}`}
                        </option>
                    ))}
                </select>
            )}

            <div className='h-6'></div>

            <div className={IOS_STYLES.videoContainer}>
                {!selectedDeviceId ? (
                    <div className="skeleton flex min-h-[300px] bg-gray-100/50 dark:bg-gray-800/50"></div>
                ) : (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            <div className='flex w-full justify-center my-5'>
                {selectedDeviceId && (!isDetecting ? (
                    <button className={IOS_STYLES.button.start} onClick={handleStartDetection}>
                        화재 감지 시작
                    </button>
                ) : (
                    <button className={IOS_STYLES.button.stop} onClick={handleStopDetection}>
                        화재 감지 중지
                    </button>
                ))}
            </div>

            <div className='flex w-full justify-center gap-2'>
                <div className='flex items-center justify-center min-h-20'>
                    {isDetecting && (
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={IOS_STYLES.resultsContainer}>
                {detectionResults.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium mb-4">처리 결과</h2>
                        {detectionResults.map((result, index) => (
                            <div key={index} className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-300">{result.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">파일명: {result.file_name}</p>
                                <h3 className="text-sm font-medium mt-2">감지된 객체:</h3>
                                <ul className="space-y-1">
                                    {result.detections.map((detection, detectionIndex) => (
                                        <li key={detectionIndex} className="text-sm flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            {detection.class_name} 
                                            <span className="text-xs text-gray-500">
                                                (신뢰도: {detection.confidence.toFixed(2)})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
