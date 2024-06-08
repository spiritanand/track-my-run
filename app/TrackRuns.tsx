"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Promise based geolocation

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

        i = i + 0.001;

        console.log({
          latitude,
          longitude,
        });

        console.log({ prevOriginPosition });

        if (
          prevOriginPosition.latitude === latitude &&
          prevOriginPosition.longitude === longitude
        )
          return;

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
    <div className="container">
      <Button
        variant={isRunStart ? "destructive" : "default"}
        onClick={() => setIsRunStart((prevState) => !prevState)}
      >
        {isRunStart ? "Stop" : "Start"}
      </Button>
      <p>{totalDistance}</p>
    </div>
  );
}

export default TrackRuns;
