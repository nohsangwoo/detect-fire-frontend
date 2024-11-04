'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
// import { useLogout } from '@/hooks/useLogout';
// import { useRouter } from 'next/navigation';
import AlertModal from './AlertModal';
import { motion } from 'framer-motion';


const REQUEST_INTERVAL = 1000; // 1초마다 요청 (밀리초 단위)

interface Detection {
    class_name: string;
    confidence: number;
    bbox: number[];
}

interface ImageProcessingResponse {
    message: string;
    file_name: string | null;
    detections: Detection[];
    result_image: string | null;
    date: string | null;
}


interface MainHomePageProps {
    userSession?: any
}
export default function MainHomePage({ userSession }: MainHomePageProps) {

    const [isDetecting, setIsDetecting] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [detectionResults, setDetectionResults] = useState<ImageProcessingResponse[]>([]);
    // const logoutMutation = useLogout();
    // const router = useRouter()
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [lastFireDetection, setLastFireDetection] = useState<number>(0);
    const [audioPermission, setAudioPermission] = useState<boolean>(false);
    const alarmRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<OscillatorNode | null>(null); // 타입 변경
    const gainNodeRef = useRef<GainNode | null>(null);
    console.log("userSession in MainHomePage: ", userSession)

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
                    withCredentials: true,
                }
            );
            return response.data;
        },
        onSuccess: (data) => {
            if (data) {
                setDetectionResults(prev => {
                    const newResults = [...prev, data];
                    // 최대 개수를 초과하면 오래된 로그부터 제거
                    return newResults.slice(-MAX_DETECTION_LOGS);
                });
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
        console.log("audioPermission: :  ", audioPermission)
        if (window.confirm("화재 경보 알림음을 허용하시겠습니까?")) {
            initAudioContext();
        }
        // if (!audioPermission) {
        // }
        setIsDetecting(true);
    };



    // const handleLogout = () => {
    //     router.push('/login')
    //     logoutMutation.mutate()
    // }

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


    // 새로운 useEffect 추가
    useEffect(() => {
        if (detectionResults.length > 0) {
            const latestResult = detectionResults[detectionResults.length - 1];
            const hasFireDetection = latestResult.detections.some(
                d => d.class_name.toLowerCase() === 'fire'
            );

            if (hasFireDetection) {
                setLastFireDetection(Date.now());
            }
        }
    }, [detectionResults]);



    // 스타일 상수 추가
    const IOS_STYLES = {
        container: "flex flex-col bg-[#f5f5f7] dark:bg-[#1d1d1f] items-center justify-items-center min-h-screen px-4 md:px-8",
        select: "appearance-none bg-white/70 dark:bg-[#2c2c2e]/70 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs",
        videoContainer: "w-full max-w-4xl rounded-2xl overflow-hidden shadow-lg bg-white/70 dark:bg-[#2c2c2e]/70 backdrop-blur-md min-h-[300px]",
        button: {
            start: "px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg active:scale-95",
            stop: "px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg active:scale-95",
            stopAlarm: "px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
        },
        resultsContainer: "w-full max-w-4xl h-[300px] rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-[#2c2c2e]/70 backdrop-blur-md overflow-hidden p-4 mt-4",
        fireAlert: "animate-border-pulse border-2 border-red-500",
        "@keyframes borderPulse": {
            "0%, 100%": { borderColor: "transparent" },
            "50%": { borderColor: "rgb(239, 68, 68)" }, // red-500
        },
        videoWrapper: "relative overflow-hidden rounded-2xl transition-all duration-300 group hover:shadow-2xl",
        deviceSelect: "relative",
        deviceSelectIcon: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none",
        loadingContainer: "absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center",
    };

    // 상수 추가
    const MAX_DETECTION_LOGS = 100; // 최대 로그 개수 - 필요에 따라 조절 가능

    // ScrollToBottom import 제거
    // import ScrollToBottom from 'react-scroll-to-bottom';

    // 대신 dynamic import 추가
    const ScrollToBottom = dynamic(
        () => import('react-scroll-to-bottom'),
        { ssr: false }
    );

    const showAlert = Date.now() - lastFireDetection < 5000;

    console.log("showAlert: ", showAlert)


    const handleStopDetection = () => {
        setIsDetecting(false);
        stopAlertSound();
    };

    const stopAlarm = () => {
        // handleStopDetection();
        stopAlertSound();
    }




    // 알람 초기화
    useEffect(() => {
        alarmRef.current = new Audio('/alarm.mp3'); // public 폴더에 alarm.mp3 파일 필요
        alarmRef.current.loop = true;

        // 컴포넌트 마운트 시 권한 확인
        if (Notification.permission === 'granted') {
            setAudioPermission(true);
        }

        return () => {
            if (alarmRef.current) {
                alarmRef.current.pause();
                alarmRef.current.currentTime = 0;
            }
        };
    }, []);

    // 오디오 컨텍스트 초기화 함수
    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioPermission(true);
        }
    };

    // 공습경보 사운드 생성 및 재생
    const playAlertSound = () => {
        if (!audioContextRef.current) return;
        stopAlertSound();

        const oscillator = audioContextRef.current.createOscillator();
        gainNodeRef.current = audioContextRef.current.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);

        // 주파수 변조
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
        oscillator.frequency.linearRampToValueAtTime(880, audioContextRef.current.currentTime + 0.5);
        oscillator.frequency.linearRampToValueAtTime(440, audioContextRef.current.currentTime + 1);

        // 볼륨 조절
        gainNodeRef.current.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);

        oscillator.connect(gainNodeRef.current);
        gainNodeRef.current.connect(audioContextRef.current.destination);

        oscillator.start();
        sourceNodeRef.current = oscillator; // OscillatorNode로 할당
    };

    // 알람 중지
    const stopAlertSound = () => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
        }
    };

    // showAlert 상태 변경 시 알람 처리
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (showAlert && audioPermission) {
            playAlertSound();
            setIsModalOpen(true);
        } else {
            stopAlertSound();
        }
    }, [showAlert, audioPermission]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            stopAlertSound();
        };
    }, []);

    return (
        <>
            <AlertModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={IOS_STYLES.container}
            >
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
                        <div className='flex gap-2'>
                            <button className={IOS_STYLES.button.stop} onClick={handleStopDetection}>
                                화재 감지 중지
                            </button>
                            <button className={IOS_STYLES.button.stopAlarm} onClick={stopAlarm}>
                                알람 중지
                            </button>
                        </div>
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

                {detectionResults.length > 0 && (
                    <div className={`${IOS_STYLES.resultsContainer} ${showAlert ? IOS_STYLES.fireAlert : ''}`}>
                        <h2 className="text-lg font-medium mb-4">처리 결과</h2>
                        <div className="h-full overflow-y-auto pb-20">
                            <div className="space-y-4">
                                {[...detectionResults].reverse().map((result, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 space-y-2 transition-all
                                                ${showAlert ? IOS_STYLES.fireAlert : ''}`}
                                        >
                                            <div className='flex justify-between'>
                                                <div>
                                                    <div className={`w-2 h-2 rounded-full ${result.message === "안전" ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{result.date}</p>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{result.message}</p>
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
                                            {result?.result_image && <p className="text-xs text-gray-500 dark:text-gray-400">파일명: {result?.result_image}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </>
    );
}
