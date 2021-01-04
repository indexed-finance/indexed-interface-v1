import React, { useState } from 'react';
import { PoolDailySnapshot } from "@indexed-finance/indexed.js/dist/types";
import Area from './area'
import Button from '../buttons/market'
import ButtonGroup from '@material-ui/core/ButtonGroup'

export type IndexChartContainerProps = {
  width: number;
  height: number;
  native: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
  snapshots: PoolDailySnapshot[];
  duration: 'day' | 'week';
  setDuration: (duration: 'day' | 'week') => void;
  yAxisKey: 'value' | 'totalValueLockedUSD';
  setYAxisKey: (yAxisKey: 'value' | 'totalValueLockedUSD') => void;
}

export const toLabels = (timestamps: number[]): string[] => timestamps
  .map(t => new Date(t * 1000))
  .map((d) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`);

function convertSnapshotsToAreaProps(snapshots: PoolDailySnapshot[], duration: 'day' | 'week', yAxisKey: string) {
  const timestamp = snapshots[snapshots.length - 1].date;
  const cutoff = duration === 'day' ? timestamp - 86400 : timestamp - 604800;
  const data = snapshots.filter(s => s.date >= cutoff).map((s) => {
    return {
      date: new Date(s.date * 1000).toString(),
      close: parseFloat(s[yAxisKey].toFixed(2))
    }
  });
  return data;
}

export default function IndexChartContainer(props: IndexChartContainerProps) {
  const { yAxisKey, setYAxisKey, setDuration, duration } = props;
  const { color, background } = document.body.style;

  const data = convertSnapshotsToAreaProps(props.snapshots, props.duration, yAxisKey)
  return <Area
    width={props.width}
    height={props.height}
    margin={props.margin}
    data={data}
  >
   <ButtonGroup style={{ position: 'absolute', display: 'inline-block' }}>
    <Button variant='outlined'
      style={{
        backgroundColor: yAxisKey === 'value' ? '#666666' : background,
        color: yAxisKey === 'value' ? 'white' : color,
        borderTop: 'none',
        borderLeft: 'none',
        borderRadius: 0
      }}
      onClick={() => setYAxisKey('value')}>
      VALUE
    </Button>
    <Button variant='outlined'
       style={{
         backgroundColor: yAxisKey === 'totalValueLockedUSD' ? '#666666' : background,
         color: yAxisKey === 'totalValueLockedUSD' ? 'white' : color,
         borderRight: 'solid 2px #666666',
         borderTop: 'none',
         borderRadius: 0
       }}
       onClick={() => setYAxisKey('totalValueLockedUSD')}>
       TVL
     </Button>
     <Button variant='outlined'
       style={{
          backgroundColor: duration === 'day' ? '#666666' : background,
          color: duration === 'day' ? 'white' : color,
          borderTop: 'none',
          marginLeft: 45,
          borderRadius: 0
        }}
      onClick={() => setDuration('day')}>
        D
     </Button>
     <Button variant='outlined'
        style={{
          backgroundColor: duration === 'week' ? '#666666' : background,
          color: duration === 'week' ? 'white' : color,
          borderTop: 'none',
          borderRadius: 0
        }}
      onClick={() => setDuration('week')}>
      W
     </Button>
    </ButtonGroup>
  </Area>
}
