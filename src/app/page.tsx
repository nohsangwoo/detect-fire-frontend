'use client';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

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

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("카메라 접근 오류:", error);
      }
    }

    setupCamera();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <video ref={videoRef} autoPlay muted playsInline style={{ width: '640px', height: '480px' }} />
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
    </div>
  );
}
