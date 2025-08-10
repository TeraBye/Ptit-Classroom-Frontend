"use client";
import Image from 'next/image';
import { Icon } from "@iconify/react/dist/iconify.js";
import { getImagePrefix } from '@/utils/util';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { API_BASE_URL } from '@/app/api/libApi/api';

export async function searchClassrooms(q: string, page = 0, size = 10) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: any = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await axios.get(`${API_BASE_URL}/searches/classroom`, {
    params: { q, page, size },
    headers
  });
  return res.data;
}

const Hero = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast('Please enter a search keyword!');
      return;
    }
    setLoading(true);
    setShowDropdown(false);
    try {
      const data = await searchClassrooms(query);
      const classrooms = data.result?.content || [];
      setResults(classrooms);
      setShowDropdown(true);
      if (!classrooms.length) {
        toast('No matching classroom found!');
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'An error occurred, please try again!';
      toast.error(message);
      setResults([]);
      setShowDropdown(false);
    }
    setLoading(false);
  };

  const handleResultClick = (id: number) => {
    router.push(`/classroom`);
    setShowDropdown(false);
  };

  return (
    <section id="home-section" className="bg-slateGray">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 pt-20">
        <div className='grid grid-cols-1 lg:grid-cols-12 space-x-1 items-center'>
          <div className='col-span-6 flex flex-col gap-8 '>
            <div className='flex gap-2 mx-auto lg:mx-0'>
              <Icon
                icon="solar:verified-check-bold"
                className="text-success text-xl inline-block me-2"
              />
              <p className='text-success text-sm font-semibold text-center lg:text-start'>Get 30% off on first enroll</p>
            </div>
            <h1 className='text-midnight_text text-4xl sm:text-5xl font-semibold pt-5 lg:pt-0'>Advance your engineering skills with us.</h1>
            <h3 className='text-black/70 text-lg pt-5 lg:pt-0'>Build skills with our courses and mentor from world-class companies.</h3>
            <form className="relative rounded-full pt-5 lg:pt-0" onSubmit={handleSearch} autoComplete="off">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="py-6 lg:py-8 pl-8 pr-20 text-lg w-full text-black rounded-full focus:outline-none shadow-input-shadow border border-gray-200 focus:border-secondary transition-all duration-200"
                placeholder="Search courses..."
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              <button
                className="bg-secondary p-5 rounded-full absolute right-2 top-2 hover:bg-secondary/90 transition-colors"
                type="submit"
                aria-label="Search"
              >
                <Icon icon="solar:magnifer-linear" className="text-white text-4xl inline-block" />
              </button>
              {loading && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin">
                  <Icon icon="svg-spinners:3-dots-fade" className="text-2xl" />
                </div>
              )}
              {showDropdown && results.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-50 max-h-72 overflow-auto border border-gray-100 animate-fade-in">
                  {results.map((classroom) => (
                    <div
                      key={classroom.id}
                      className="px-5 py-3 cursor-pointer hover:bg-secondary/10 transition flex flex-col gap-1 border-b last:border-b-0"
                      onMouseDown={() => handleResultClick(classroom.id)}
                    >
                      <span className="font-semibold text-base text-midnight_text">{classroom.name}</span>
                      <span className="text-xs text-gray-500">{classroom.subject?.name || 'No subject'}</span>
                      <span className="text-xs text-gray-400">Teacher: {classroom.teacherUsername}</span>
                    </div>
                  ))}
                </div>
              )}
            </form>
            <div className='flex items-center justify-between pt-10 lg:pt-4'>
              <div className='flex gap-2'>
                <Image src={`${getImagePrefix()}images/banner/check-circle.svg`} alt="check-image" width={30} height={30} className='smallImage' />
                <p className='text-sm sm:text-lg font-normal text-black'>Flexible</p>
              </div>
              <div className='flex gap-2'>
                <Image src={`${getImagePrefix()}images/banner/check-circle.svg`} alt="check-image" width={30} height={30} className='smallImage' />
                <p className='text-sm sm:text-lg font-normal text-black'>Learning path</p>
              </div>
              <div className='flex gap-2'>
                <Image src={`${getImagePrefix()}images/banner/check-circle.svg`} alt="check-image" width={30} height={30} className='smallImage' />
                <p className='text-sm sm:text-lg font-normal text-black'>Community</p>
              </div>
            </div>
          </div>
          <div className='col-span-6 flex justify-center'>
            <Image src={`${getImagePrefix()}images/banner/mahila.png`} alt="nothing" width={1000} height={805} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
