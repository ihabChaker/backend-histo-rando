import { Injectable, BadRequestException } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';

export interface GPXWaypoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: string;
  name?: string;
}

export interface GPXTrack {
  name?: string;
  waypoints: GPXWaypoint[];
}

export interface GPXData {
  startPoint: { lat: number; lon: number };
  endPoint: { lat: number; lon: number };
  waypoints: GPXWaypoint[];
  totalDistance?: number;
  elevationGain?: number;
}

@Injectable()
export class GpxParserService {
  private readonly xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
  }

  /**
   * Parse GPX file and extract waypoints and track data
   */
  async parseGPXFile(filePath: string): Promise<GPXData> {
    try {
      // Read file content
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      // Parse XML
      const parsedData = this.xmlParser.parse(fileContent);

      if (!parsedData.gpx) {
        throw new BadRequestException(
          'Invalid GPX file: missing gpx root element',
        );
      }

      const gpx = parsedData.gpx;
      const waypoints: GPXWaypoint[] = [];

      // Extract track points (most common in hiking GPX files)
      if (gpx.trk) {
        const tracks = Array.isArray(gpx.trk) ? gpx.trk : [gpx.trk];

        for (const track of tracks) {
          if (track.trkseg) {
            const segments = Array.isArray(track.trkseg)
              ? track.trkseg
              : [track.trkseg];

            for (const segment of segments) {
              if (segment.trkpt) {
                const points = Array.isArray(segment.trkpt)
                  ? segment.trkpt
                  : [segment.trkpt];

                for (const point of points) {
                  waypoints.push({
                    lat: parseFloat(point.lat),
                    lon: parseFloat(point.lon),
                    ele: point.ele ? parseFloat(point.ele) : undefined,
                    time: point.time,
                  });
                }
              }
            }
          }
        }
      }

      // Extract waypoints (marked points of interest)
      if (gpx.wpt) {
        const wpts = Array.isArray(gpx.wpt) ? gpx.wpt : [gpx.wpt];

        for (const wpt of wpts) {
          waypoints.push({
            lat: parseFloat(wpt.lat),
            lon: parseFloat(wpt.lon),
            ele: wpt.ele ? parseFloat(wpt.ele) : undefined,
            name: wpt.name,
          });
        }
      }

      // Extract route points (alternative to tracks)
      if (gpx.rte && waypoints.length === 0) {
        const routes = Array.isArray(gpx.rte) ? gpx.rte : [gpx.rte];

        for (const route of routes) {
          if (route.rtept) {
            const points = Array.isArray(route.rtept)
              ? route.rtept
              : [route.rtept];

            for (const point of points) {
              waypoints.push({
                lat: parseFloat(point.lat),
                lon: parseFloat(point.lon),
                ele: point.ele ? parseFloat(point.ele) : undefined,
                name: point.name,
              });
            }
          }
        }
      }

      if (waypoints.length === 0) {
        throw new BadRequestException(
          'No waypoints or track points found in GPX file',
        );
      }

      // Calculate total distance and elevation gain
      const { distance, elevationGain } = this.calculateStats(waypoints);

      return {
        startPoint: {
          lat: waypoints[0].lat,
          lon: waypoints[0].lon,
        },
        endPoint: {
          lat: waypoints[waypoints.length - 1].lat,
          lon: waypoints[waypoints.length - 1].lon,
        },
        waypoints,
        totalDistance: distance,
        elevationGain,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to parse GPX file: ${error.message}`,
      );
    }
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate total distance and elevation gain from waypoints
   */
  private calculateStats(waypoints: GPXWaypoint[]): {
    distance: number;
    elevationGain: number;
  } {
    let totalDistance = 0;
    let elevationGain = 0;

    for (let i = 1; i < waypoints.length; i++) {
      const prev = waypoints[i - 1];
      const curr = waypoints[i];

      // Calculate distance
      totalDistance += this.calculateDistance(
        prev.lat,
        prev.lon,
        curr.lat,
        curr.lon,
      );

      // Calculate elevation gain
      if (prev.ele !== undefined && curr.ele !== undefined) {
        const elevDiff = curr.ele - prev.ele;
        if (elevDiff > 0) {
          elevationGain += elevDiff;
        }
      }
    }

    return {
      distance: Math.round(totalDistance * 100) / 100, // Round to 2 decimals
      elevationGain: Math.round(elevationGain),
    };
  }

  /**
   * Convert waypoints to simplified GeoJSON string for storage
   */
  toGeoJSON(waypoints: GPXWaypoint[]): string {
    const coordinates = waypoints.map((wp) => [wp.lon, wp.lat]);

    return JSON.stringify({
      type: 'LineString',
      coordinates,
    });
  }

  /**
   * Delete uploaded file
   */
  deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
    }
  }
}
