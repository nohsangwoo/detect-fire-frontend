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




    return (
        <div className="flex flex-col bg-pureblack items-center justify-items-center min-h-screen px-8">
            <div className='h-10'></div>

            {devices.length > 0 && (
                <select
                    className="select select-primary w-full max-w-xs"
                    onChange={(e) => setSelectedDeviceId(e.target.value)}>
                    <option value="">카메라를 선택하세요</option>
                    {/* <option value="" disabled>Pick your Camera</option> */}

                    {devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `카메라 ${device.deviceId}`}
                        </option>
                    ))}
                </select>
            )}

            <div className='h-10'></div>

            <div className='w-full rounded-lg overflow-hidden shadow-md min-h-[300px]'>
                {!selectedDeviceId ? (
                    <div className="skeleton flex min-h-[300px] "></div>
                ) : (
                    <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%' }} />
                )}
            </div>


            <div className='flex w-full justify-center my-5'>
                {selectedDeviceId && (!isDetecting ? (
                    <button className='btn btn-primary text-lg' onClick={handleStartDetection}>화재 감지 시작</button>
                ) : (
                    <button className='btn btn-error text-lg' onClick={handleStopDetection}>화재 감지 중지</button>
                ))}
            </div>
            <div className='flex w-full justify-center'>
                <div className='flex items-center justify-center min-h-20'>
                    {/* {isPending && (
                        <span className="loading loading-ring loading-lg"></span>
                    )} */}
                    {isDetecting && (
                        <>
                            <span className="loading loading-ball loading-xs"></span>
                            <span className="loading loading-ball loading-sm"></span>
                            <span className="loading loading-ball loading-md"></span>
                            <span className="loading loading-ball loading-lg"></span>
                        </>
                    )}
                </div>
                <div className='flex items-center justify-center min-h-10'>
                    {error && <p>오류 발생: {(error as Error).message}</p>}
                </div>
            </div>
            <div className='w-full h-[50vh] rounded-lg border overflow-y-auto p-2'>
                {detectionResults.length > 0 && (
                    <div>
                        <h2>처리 결과:</h2>
                        {detectionResults.map((result, index) => (
                            <div key={index}>
                                <p>{result.message}</p>
                                <p>파일명: {result.file_name}</p>
                                <h3>감지된 객체:</h3>
                                <ul>
                                    {result.detections.map((detection, detectionIndex) => (
                                        <li key={detectionIndex}>
                                            {detection.class_name} (신뢰도: {detection.confidence.toFixed(2)})
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
