const fs = require('fs');
let jsx = fs.readFileSync('explore_body.jsx', 'utf8');
let comp = `"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './explore.css';

export default function ExploreClient({ data }) {
  useEffect(() => {
    // We will inject the JS here
  }, []);

  return (
    <div className="explore-page-root">
${jsx}
    </div>
  );
}
`;
fs.writeFileSync('frontend/app/explore/ExploreClient.js', comp);
