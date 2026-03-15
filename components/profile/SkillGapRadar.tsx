'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface SkillData {
    axis: string;
    value: number;
}

interface SkillGapRadarProps {
    data: SkillData[];
}

export default function SkillGapRadar({ data }: SkillGapRadarProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data) return;

        const width = 300;
        const height = 300;
        const margin = 50;
        const radius = Math.min(width, height) / 2 - margin;
        const levels = 5;
        const maxValue = 100;
        const angleSlice = (Math.PI * 2) / data.length;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const g = svg
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Circular grid levels
        for (let j = 0; j < levels; j++) {
            const levelFactor = radius * ((j + 1) / levels);
            g.selectAll('.levels')
                .data(data)
                .enter()
                .append('line')
                .attr('x1', (d, i) => levelFactor * Math.cos(angleSlice * i - Math.PI / 2))
                .attr('y1', (d, i) => levelFactor * Math.sin(angleSlice * i - Math.PI / 2))
                .attr('x2', (d, i) => levelFactor * Math.cos(angleSlice * (i + 1) - Math.PI / 2))
                .attr('y2', (d, i) => levelFactor * Math.sin(angleSlice * (i + 1) - Math.PI / 2))
                .attr('class', 'line')
                .style('stroke', 'var(--border-subtle)')
                .style('stroke-opacity', '0.3')
                .style('stroke-width', '0.5px')
                .attr('transform', `translate(0, 0)`);
        }

        // Axes
        const axis = g.selectAll('.axis')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'axis');

        axis.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('y2', (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
            .style('stroke', 'var(--border-subtle)')
            .style('stroke-opacity', '0.2')
            .style('stroke-width', '1px');

        // Radar area
        const radarLine = d3.lineRadial<SkillData>()
            .radius(d => (d.value / maxValue) * radius)
            .angle((d, i) => i * angleSlice)
            .curve(d3.curveLinearClosed);

        g.append('path')
            .datum(data)
            .attr('d', radarLine)
            .style('fill', 'var(--brand-primary)')
            .style('fill-opacity', 0.3)
            .style('stroke', 'var(--brand-primary)')
            .style('stroke-width', '3px')
            .style('filter', 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))');

        // Data points
        g.selectAll('.radarCircle')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'radarCircle')
            .attr('r', 4)
            .attr('cx', (d, i) => (d.value / maxValue) * radius * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('cy', (d, i) => (d.value / maxValue) * radius * Math.sin(angleSlice * i - Math.PI / 2))
            .style('fill', 'var(--brand-primary)')
            .style('stroke', '#fff')
            .style('stroke-width', '2px');

        // Labels
        axis.append('text')
            .attr('class', 'legend')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('x', (d, i) => (radius + 25) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('y', (d, i) => (radius + 25) * Math.sin(angleSlice * i - Math.PI / 2))
            .text(d => d.axis)
            .style('font-size', '10px')
            .style('fill', 'var(--text-muted)')
            .style('font-weight', 'bold')
            .style('text-transform', 'uppercase')
            .style('letter-spacing', '0.05em');

    }, [data]);

    return (
        <div className="flex items-center justify-center w-full h-full min-h-[300px]">
            <svg ref={svgRef} width="300" height="300" className="overflow-visible" />
        </div>
    );
}
