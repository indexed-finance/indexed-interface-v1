import React from 'react';
import { Group } from '@vx/group';
import genBins, { Bin, Bins } from '@vx/mock-data/lib/generators/genBins';
import { scaleOrdinal, scaleLinear } from '@vx/scale';
import { HeatmapCircle, HeatmapRect } from '@vx/heatmap';

const hot1 = '#ff005a';
const hot2 = '#ffb1cc';
const cool1 = '#00e79a';
const cool2 = '#ffb1cc';

const binData = genBins(/* length = */ 16, /* height = */ 16);

function max<Datum>(data: Datum[], value: (d: Datum) => number): number {
  return Math.max(...data.map(value));
}

function min<Datum>(data: Datum[], value: (d: Datum) => number): number {
  return Math.min(...data.map(value));
}

// accessors
const bins = (d: Bins) => d.bins;
const count = (d: Bin) => d.count;

const colorMax = max(binData, d => max(bins(d), count));
const bucketSizeMax = max(binData, d => bins(d).length);

// scales
const xScale = scaleLinear<number>({
  domain: [0, binData.length],
});
const yScale = scaleLinear<number>({
  domain: [0, bucketSizeMax],
});
const circleColorScale = scaleLinear<string>({
  range: [hot1, hot2],
  domain: [0, colorMax],
});
const rectColorScale = scaleOrdinal({
  range: [ cool1, hot1 ],
  domain: [0, colorMax],
});
const opacityScale = scaleLinear<number>({
  range: [0, 1],
  domain: [0, colorMax],
});

export type HeatmapProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  separation?: number;
  events?: boolean;
};

const defaultMargin = { top: 0, left: 0, right: 0, bottom: 0 };

export default ({
  width,
  height,
  events = false,
  margin = defaultMargin,
  separation = 20,
}: HeatmapProps) => {
  // bounds
  const size =
    width > margin.left + margin.right ? width - margin.left - margin.right - separation : width;
  const xMax = size * 1.05;
  const yMax = height;

  const binWidth = xMax / binData.length;
  const binHeight = yMax / bucketSizeMax;
  const radius = min([binWidth, binHeight], d => d) / 2;

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);

  return width < 10 ? null : (
    <svg width={width} height={height}>
        <HeatmapRect
          data={binData}
          xScale={xScale}
          yScale={yScale}
          colorScale={rectColorScale}
          opacityScale={opacityScale}
          binWidth={binWidth}
          binHeight={binHeight}
          gap={2}
        >
          {heatmap =>
            heatmap.map(heatmapBins =>
              heatmapBins.map(bin => (
                <rect
                  key={`heatmap-rect-${bin.row}-${bin.column}`}
                  className="vx-heatmap-rect"
                  width={bin.width}
                  height={bin.height}
                  x={bin.x}
                  y={bin.y}
                  fill={bin.color}
                  fillOpacity={bin.opacity}
                  onClick={() => {
                    if (!events) return;
                    const { row, column } = bin;
                    alert(JSON.stringify({ row, column, bin: bin.bin }));
                  }}
                />
              )),
            )
          }
        </HeatmapRect>
    </svg>
  );
};
