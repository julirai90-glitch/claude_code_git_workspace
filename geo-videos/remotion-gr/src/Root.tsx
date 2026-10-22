import React from 'react';
import {Composition} from 'remotion';
import {Nullgrad, TOTAL_FRAMES} from './Nullgrad';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Nullgrad"
    component={Nullgrad}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
