import React from 'react'
import { Header } from '@/app/(frontend)/components/Header'
import { ExamCategoriesBar } from '@/app/(frontend)/components/ExamCategoriesBar'
import { FooterComponent } from '@/app/(frontend)/components/home/FooterComponent'
import AboutLMSDoors from '../components/AboutLMSDoors'


export default async function AboutPage() {
    
  
    return (
        <div>
            <Header />
            <ExamCategoriesBar />
            <AboutLMSDoors />
            <FooterComponent />
        </div>
    );
}