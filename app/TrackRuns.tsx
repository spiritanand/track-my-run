"use client";

import { useEffect, useState } from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient"; // Promise based geolocation

// Promise based geolocation
const getLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

async function geoFindMe() {
  const position = (await getLocation()) as GeolocationPosition;

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  return {
    latitude,
    longitude,
  };
}

let i = 0;

function TrackRuns() {
  const [isRunStart, setIsRunStart] = useState(false);
  const [prevOriginPosition, setPrevOriginPosition] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [totalDistance, setTotalDistance] = useState(0);

  useEffect(() => {
    const trackRun = async () => {
      if (isRunStart) {
        const { latitude, longitude } = await geoFindMe();

        console.log({
          latitude,
          longitude,
        });

        console.log({ prevOriginPosition });

        if (
          prevOriginPosition.latitude === 0 &&
          prevOriginPosition.longitude === 0
        )
          return setPrevOriginPosition({
            latitude,
            longitude,
          });

        const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
        const body = {
          origin: {
            location: {
              latLng: {
                latitude: prevOriginPosition.latitude,
                longitude: prevOriginPosition.longitude,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: latitude,
                longitude: longitude + i,
              },
            },
          },
          travelMode: "WALK",
          units: "METRIC",
        };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
            "X-Goog-FieldMask":
              "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        const routes = data.routes;

        // distance in meters
        const distance = routes[0]?.distanceMeters;

        console.log({
          data,
          distance,
        });

        if (distance) {
          setTotalDistance((prevState) => prevState + distance);
        }

        setPrevOriginPosition({
          latitude,
          longitude,
        });
      }
    };

    const intervalId = setInterval(() => {
      void trackRun();
    }, 5000);

    // Cleanup function to clear the interval
    return () => {
      clearInterval(intervalId);
    };
  }, [isRunStart, prevOriginPosition]);

  return (
    <div className="container flex items-center justify-center flex-col gap-5 mt-8 lg:mt-20">
      <button
        className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
        onClick={() => setIsRunStart((prevState) => !prevState)}
      >
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl text-2xl">
          {isRunStart ? "Stop" : "Start"}
        </span>
      </button>

      <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900">
        <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
          Distance Covered
        </p>
        <p className="text-5xl text-neutral-600 dark:text-neutral-400">
          {totalDistance} KM
        </p>
      </BackgroundGradient>
    </div>
  );
}

export default TrackRuns;
