
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { VectorPoint } from '../types';

interface QdrantVizProps {
  hits: VectorPoint[];
}

export const QdrantViz: React.FC<QdrantVizProps> = ({ hits }) => {
  // Generate mock data points for the cluster visualization if no hits
  const displayData = hits.length > 0 
    ? hits.map((h, i) => ({
        x: Math.random() * 10 + 40,
        y: Math.random() * 10 + 40,
        z: h.score * 100,
        name: h.content.substring(0, 30),
        collection: h.collection,
        score: h.score
      }))
    : Array.from({ length: 20 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: 10,
        name: 'Background Data',
        collection: 'cluster',
        score: 0.1
      }));

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center">
        <i className="fas fa-layer-group mr-2 text-purple-400"></i> Vector Space (Qdrant)
      </h2>
      <div className="flex-1 bg-[#0d0d10] rounded border border-[#1e1e24] p-2 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <XAxis type="number" dataKey="x" name="stature" hide />
            <YAxis type="number" dataKey="y" name="weight" hide />
            <ZAxis type="number" dataKey="z" range={[50, 400]} name="score" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }} 
              contentStyle={{ backgroundColor: '#111114', borderColor: '#2d2d35', color: '#fff', fontSize: '10px' }}
            />
            <Scatter name="Qdrant Collections" data={displayData}>
              {displayData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.score > 0.5 ? '#10b981' : '#334155'} 
                  fillOpacity={0.6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1">
        {hits.map((h, i) => (
          <div key={i} className="flex justify-between items-center text-[10px] p-1 bg-[#111114] rounded">
            <span className="text-slate-500 font-bold uppercase truncate max-w-[150px]">{h.content}</span>
            <div className="flex gap-2">
              <span className="text-purple-400 px-1 border border-purple-500/30 rounded">{h.collection}</span>
              <span className="text-emerald-400">{(h.score * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
