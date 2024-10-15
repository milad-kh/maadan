'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';

export default function MiningVisit() {
  const [coordinates, setCoordinates] = useState('');
  const [utmCoordinates, setUtmCoordinates] = useState('');
  const [images, setImages] = useState([]);
  const [visitData, setVisitData] = useState(null);
  const videoRef = useRef(null);

  const getCoordinates = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const coords = convertToDMS(lat, lon);
          const utmCoords = convertToUTM(lat, lon);
          setCoordinates(coords);
          setUtmCoordinates(utmCoords);
        },
        (error) => {
          alert('خطا در دریافت مختصات: ' + error.message);
        }
      );
    } else {
      alert('مرورگر شما از این قابلیت پشتیبانی نمی‌کند.');
    }
  };

  const convertToUTM = (lat, lon) => {
    const zone = Math.floor((lon + 180) / 6) + 1;
    const easting = 500000 + lon * 111320;
    const northing = lat >= 0 ? lat * 110574 : lat * 110574 + 10000000;
    return `زون ${zone}, مختصات شرقی ${easting.toFixed(2)}, مختصات شمالی ${northing.toFixed(2)}`;
  };

  const convertToDMS = (lat, lon) => {
    const toDMS = (deg) => {
      const d = Math.floor(deg);
      const minFloat = (deg - d) * 60;
      const m = Math.floor(minFloat);
      const secFloat = (minFloat - m) * 60;
      const s = Math.round(secFloat);
      return `${d}° ${m}' ${s}"`;
    };
    return `${toDMS(lat)} N, ${toDMS(lon)} E`;
  };

  const captureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.play();
      }
    } catch (error) {
      alert('خطا در دسترسی به دوربین: ' + error);
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0);
      context.font = '20px Vazir';
      context.fillStyle = 'black';
      context.fillText(coordinates, 10, 30);
      const imageData = canvas.toDataURL('image/png');
      setImages((prevImages) => [...prevImages, imageData]);
    }
  };

  const handleSubmit = () => {
    const visitDetails = {
      visitDate: document.getElementById('visit-date').value,
      departureTime: document.getElementById('departure-time').value,
      vehicle: document.getElementById('vehicle').value,
      reporter: document.getElementById('reporter').value,
      idCode: document.getElementById('id-code').value,
      nationalId: document.getElementById('national-id').value,
      visitDescription: document.getElementById('visit-description').value,
      images: images,
    };
    setVisitData(visitDetails);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold mb-8">بازدید از محدوده معدنی</h1>
        <button onClick={getCoordinates} className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-700">
          دریافت مختصات
        </button>
        {coordinates && (
          <div className="border-2 border-blue-500 p-4 mt-4 rounded-lg">
            <p>{coordinates}</p>
            <p>{utmCoordinates}</p>
            <a
              href={`https://www.google.com/maps?q=${coordinates}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline mt-2 block"
            >
              مشاهده در گوگل مپ
            </a>
          </div>
        )}
        <button onClick={captureImage} className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-700 mt-4">
          دریافت تصویر
        </button>
        <video ref={videoRef} className="mt-4 w-64 h-48 border-2 border-gray-300"></video>
        <button onClick={handleCapture} className="bg-yellow-500 text-white p-4 rounded-lg hover:bg-yellow-700 mt-4">
          تهیه عکس
        </button>
        <div className="flex flex-wrap gap-4 mt-4">
          {images.map((image, index) => (
            <img key={index} src={image} alt={`Capture ${index + 1}`} className="w-32 h-32 border-2 border-blue-500 rounded-lg" />
          ))}
        </div>
        <div className="flex flex-col gap-4 mt-8">
          <label>
            تاریخ بازدید:
            <input type="date" id="visit-date" className="border p-2 rounded-lg" />
          </label>
          <label>
            ساعت حرکت:
            <input type="time" id="departure-time" className="border p-2 rounded-lg" />
          </label>
          <label>
            وسیله نقلیه:
            <input type="text" id="vehicle" defaultValue="سازمانی" className="border p-2 rounded-lg" />
          </label>
          <label>
            نام ثبت کننده گزارش:
            <input type="text" id="reporter" defaultValue="علی فروردین" className="border p-2 rounded-lg" />
          </label>
          <label>
            کد شناسایی:
            <input type="text" id="id-code" defaultValue="11111111" className="border p-2 rounded-lg" />
          </label>
          <label>
            کد ملی:
            <input type="text" id="national-id" defaultValue="094*******" className="border p-2 rounded-lg" />
          </label>
          <label>
            شرح بازدید:
            <textarea id="visit-description" className="border p-2 rounded-lg" />
          </label>
          <button onClick={handleSubmit} className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-700">
            ثبت نهایی
          </button>
        </div>
        {visitData && (
          <div className="mt-8 p-4 border-2 border-gray-500 rounded-lg">
            <pre>{JSON.stringify(visitData, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}