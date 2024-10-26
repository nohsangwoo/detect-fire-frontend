'use client';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const FRAME_RATE = 4; // 초당 4프레임
const FRAME_COUNT = 3; // 3프레임씩 요청

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
  const [frames, setFrames] = useState<Blob[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [detectionResults, setDetectionResults] = useState<ImageProcessingResponse[]>([]);

  const processFrames = async () => {
    if (frames.length !== FRAME_COUNT) return null;

    const formData = new FormData();
    frames.forEach((frame, index) => {
      formData.append(`file`, frame, `frame${index}.jpg`);
    });

    const response = await axios.post<ImageProcessingResponse>(
      'http://localhost:8000/detectfromimage',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  };

  const { mutate, isPending, error } = useMutation({
    mutationFn: processFrames,
    onSuccess: (data) => {
      if (data) {
        setDetectionResults(prev => [...prev, data]);
        console.log("새로운 감지 결과:", data);
        console.log("누적된 감지 결과:", [...detectionResults, data]);
      }
    },
    onError: (error) => {
      console.error("요청 처리 중 오류 발생:", error);
      // 사용자에게 오류 메시지 표시
    },
    onSettled: () => {
      console.log("요청 완료");
    }
  });

  useEffect(() => {
    let captureInterval: NodeJS.Timeout;

    const captureFrames = async () => {
      if (videoRef.current && isDetecting) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        captureInterval = setInterval(() => {
          if (ctx && videoRef.current) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                setFrames(prev => [...prev, blob].slice(-FRAME_COUNT));
              }
            }, 'image/jpeg');
          }
        }, 1000 / FRAME_RATE);
      }
    };

    if (isDetecting) {
      captureFrames();
    }

    return () => {
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, [isDetecting]);

  useEffect(() => {
    console.log("--------------------------------")
    console.log("isDetecting: ", isDetecting);
    console.log("frames: ", frames);
    console.log("framelength: ", frames.length);
    console.log("FRAME_COUNT: ", FRAME_COUNT)

    const condition = isDetecting && frames.length === FRAME_COUNT
    console.log("condition: ", condition)

    let processInterval: NodeJS.Timeout | null = null;

    if (condition) {
      console.log("processInterval 설정 시도")
      processInterval = setInterval(() => {
        console.log("mutate 실행")
        mutate();
      }, 1000 / FRAME_RATE * FRAME_COUNT);
    }

    console.log("--------------------------------")

    return () => {
      if (processInterval) {
        console.log("이전 processInterval 정리")
        clearInterval(processInterval);
      }
    };
  }, [isDetecting, frames.length, mutate]);

  const handleStartDetection = () => {
    setIsDetecting(true);
  };

  const handleStopDetection = () => {
    setIsDetecting(false);
    setFrames([]);
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
              <img src={`http://localhost:8000/${result.result_image}`} alt="처리된 이미지" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
