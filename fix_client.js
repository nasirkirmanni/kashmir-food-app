const fs = require('fs');
let js = fs.readFileSync('explore_scripts.js', 'utf8');
js = js.replace(/<script>/g, '').replace(/<\/script>/g, '');
js = js.replace(/document\.addEventListener\('DOMContentLoaded', function\(\) \{[\s\S]*?\}\);/g, '');
js = js.replace(/window\.addEventListener\('load', \(\)=>(.*?)\);/g, '$1');
js = "const WW_PLACEHOLDER = '/images/placeholder.jpg';\n" + js;

let comp = fs.readFileSync('generate_client.js', 'utf8');
// regenerate
let html = fs.readFileSync('explore_body.jsx', 'utf8');
let jsx = `"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './explore.css';

export default function ExploreClient({ data }) {
  useEffect(() => {
${js}
  }, []);

  return (
    <div className="explore-page-root">
${html}
    </div>
  );
}
`;
fs.writeFileSync('frontend/app/explore/ExploreClient.js', jsx);
