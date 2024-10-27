'use client';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useLogout } from '@/hooks/useLogout';
import useMe from '@/hooks/useMe';
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

export default function Home() {
  const [isDetecting, setIsDetecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [detectionResults, setDetectionResults] = useState<ImageProcessingResponse[]>([]);
  const logoutMutation = useLogout();
  const router = useRouter()
  const meQuery = useMe();
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
        'http://localhost:8000/detectfromimage',
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


  useEffect(() => {
    if (meQuery.error) {
      console.log('로그인 상태 확인 오류:', meQuery.error)
      router.push('/login')
    }
  }, [meQuery.error])


  if (meQuery.isLoading) {
    return <div>loading...</div>
  }


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {devices.length > 0 && (
        <select onChange={(e) => setSelectedDeviceId(e.target.value)}>
          <option value="">카메라를 선택하세요</option>
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `카메라 ${device.deviceId}`}
            </option>
          ))}
        </select>
      )}
      {selectedDeviceId && (
        <video ref={videoRef} autoPlay muted playsInline style={{ width: '640px', height: '480px' }} />
      )}
      {!isDetecting ? (
        <button onClick={handleStartDetection}>화재 감지 시작</button>
      ) : (
        <button onClick={handleStopDetection}>화재 감지 중지</button>
      )}
      {isPending && <p>처리 중...</p>}
      {error && <p>오류 발생: {(error as Error).message}</p>}
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
              {/* <img src={`http://localhost:8000/${result.result_image}`} alt="처리된 이미지" /> */}
            </div>
          ))}
        </div>
      )}
      <button onClick={handleLogout}>로그아웃</button>
    </div>
  );
}
