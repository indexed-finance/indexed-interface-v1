import React, { useState } from 'react';
import { PoolDailySnapshot } from "@indexed-finance/indexed.js/dist/types";
import { Button } from '@material-ui/core';
import Area from './area'

export type IndexChartContainerProps = {
  width: number;
  height: number;
  color: string;
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
  const {yAxisKey, setYAxisKey} = props;
  // const data = ;
  function DurationButtons() {
    return <div style={{ position: 'absolute', right: 0, display: 'flex', flexDirection: 'row' }}>
      <Button variant={props.duration === 'day' ? 'contained' : 'outlined'} onClick={() => props.setDuration('day')}>
        D
      </Button>
      <Button variant={props.duration === 'day' ? 'outlined' : 'contained'} onClick={() => props.setDuration('week')}>
        W
      </Button>
    </div>
  }
  function KeyButtons() {
    return <div style={{ position: 'absolute', right: 0, display: 'flex', flexDirection: 'row', marginTop: 50 }}>
      <Button variant={yAxisKey === 'value' ? 'contained' : 'outlined'} onClick={() => setYAxisKey('value')}>
        VALUE
      </Button>
      <Button variant={yAxisKey === 'totalValueLockedUSD' ? 'contained' : 'outlined'} onClick={() => setYAxisKey('totalValueLockedUSD')}>
        TVL
      </Button>
    </div>
  }
  const data = convertSnapshotsToAreaProps(props.snapshots, props.duration, yAxisKey)
  return <Area
    width={props.width}
    height={props.height}
    margin={props.margin}
    data={data}
    color={props.color}
  >
    <DurationButtons />
    <KeyButtons />
  </Area>
}