"use client";
import { useState, FormEvent } from 'react';
import { Facebook, Instagram } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageStatus, setMessageStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setMessageStatus({ text: 'Please fill in all fields.', type: 'error' });
      return;
    }

    if (!isValidEmail(formData.email)) {
      setMessageStatus({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    if (formData.name.length < 2) {
      setMessageStatus({ text: 'Name must be at least 2 characters.', type: 'error' });
      return;
    }

    if (formData.message.length < 10) {
      setMessageStatus({ text: 'Message must be at least 10 characters.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageStatus({ text: 'Thank you! Your message has been sent successfully.', type: 'success' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setMessageStatus({ text: data.message || 'Something went wrong. Please try again.', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessageStatus({ text: 'Unable to send message. Please try again later.', type: 'error' });
    } finally {
      setIsSubmitting(false);
      
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        setMessageStatus(null);
      }, 5000);
    }
  };

  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="mt-[140px] px-[50px] py-[60px] pb-[80px] min-h-[calc(100vh-140px)] md:px-[30px] md:mt-[100px] md:py-[40px] md:pb-[60px] sm:px-5 sm:mt-[100px] sm:py-[40px] sm:pb-[60px]">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-[80px] items-start md:gap-[50px]">
        {/* Left Section - Contact Information */}
        <div className="pt-[40px]">
          <h1 className="font-[family-name:var(--font-headers)] text-[48px] font-normal text-black mb-[30px] leading-[1.2] md:text-4xl sm:text-[28px]">
            Contact Us
          </h1>
          <p className="font-[family-name:var(--font-body)] text-base text-[#666] mb-2.5 leading-[1.6]">
            Great vision without great people is irrelevant.
          </p>
          <p className="font-[family-name:var(--font-body)] text-sm text-[#999] mb-[40px]">
            Let's work together.
          </p>
          
          <div className="mt-[50px]">
            <h3 className="font-[family-name:var(--font-nav)] text-sm tracking-wider uppercase text-black mb-[15px]">
              Our Location:
            </h3>
            <address className="font-[family-name:var(--font-body)] text-sm leading-[1.8] text-[#666] not-italic mb-5">
              Midrand, Johannesburg<br />
              Gauteng, South Africa<br />
            </address>
            
            <div className="space-y-2 mb-[30px]">
              <p className="font-[family-name:var(--font-body)] text-sm text-black">
                <strong className="font-semibold">Email:</strong> babyfictions2021@gmail.com
              </p>
              <p className="font-[family-name:var(--font-body)] text-sm text-black">
                <strong className="font-semibold">Enquiries:</strong> +27 72 096 3819
              </p>
              <p className="font-[family-name:var(--font-body)] text-sm text-black">
                <strong className="font-semibold">WhatsApp:</strong> +27 84 848 8516
              </p>
            </div>
            
            {/* Social Media Links */}
            <div className="flex gap-5 mt-[30px] sm:gap-[15px]">
              <a 
                href="https://facebook.com" 
                className="w-10 h-10 flex items-center justify-center border border-black rounded-full text-black text-lg no-underline transition-all duration-300 hover:bg-black hover:text-white sm:w-9 sm:h-9 sm:text-base"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me/27848488516" 
                className="w-10 h-10 flex items-center justify-center border border-black rounded-full text-black text-lg no-underline transition-all duration-300 hover:bg-black hover:text-white sm:w-9 sm:h-9 sm:text-base"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                className="w-10 h-10 flex items-center justify-center border border-black rounded-full text-black text-lg no-underline transition-all duration-300 hover:bg-black hover:text-white sm:w-9 sm:h-9 sm:text-base"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://tiktok.com" 
                className="w-10 h-10 flex items-center justify-center border border-black rounded-full text-black text-lg no-underline transition-all duration-300 hover:bg-black hover:text-white sm:w-9 sm:h-9 sm:text-base"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Right Section - Contact Form */}
        <div className="bg-[rgba(248,248,248,0.8)] p-[50px_60px] rounded-lg backdrop-blur-[10px] md:p-[40px_30px] sm:p-[30px_25px]">
          <p className="font-[family-name:var(--font-accent)] text-lg text-black mb-2 tracking-[0.5px]">
            Great vision without great people is irrelevant.
          </p>
          <p className="font-[family-name:var(--font-body)] text-[13px] text-[#999] mb-[30px]">
            Let's work together.
          </p>
          
          {/* Success/Error Message */}
          {messageStatus && (
            <div 
              className={`p-[15px_20px] rounded mb-5 font-[family-name:var(--font-body)] text-sm ${
                messageStatus.type === 'success' 
                  ? 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]' 
                  : 'bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb]'
              }`}
            >
              {messageStatus.text}
            </div>
          )}
          
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                className="w-full p-[15px_20px] border border-[#ddd] rounded font-[family-name:var(--font-body)] text-sm text-black bg-white transition-all duration-300 outline-none focus:border-black focus:shadow-[0_0_0_2px_rgba(0,0,0,0.1)] placeholder:text-[#999]" 
                placeholder="Enter your Name" 
                required
                minLength={2}
              />
            </div>
            
            <div className="flex flex-col">
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                className="w-full p-[15px_20px] border border-[#ddd] rounded font-[family-name:var(--font-body)] text-sm text-black bg-white transition-all duration-300 outline-none focus:border-black focus:shadow-[0_0_0_2px_rgba(0,0,0,0.1)] placeholder:text-[#999]" 
                placeholder="Enter a valid email address" 
                required
              />
            </div>
            
            <div className="flex flex-col">
              <textarea 
                name="message" 
                value={formData.message}
                onChange={handleChange}
                className="w-full p-[15px_20px] border border-[#ddd] rounded font-[family-name:var(--font-body)] text-sm text-black bg-white transition-all duration-300 outline-none focus:border-black focus:shadow-[0_0_0_2px_rgba(0,0,0,0.1)] placeholder:text-[#999] min-h-[150px] resize-y" 
                placeholder="Enter your message" 
                required
                minLength={10}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-[180px] p-[15px_30px] bg-[#d9d9d9] border-none rounded font-[family-name:var(--font-nav)] text-sm font-semibold tracking-[2px] uppercase text-black cursor-pointer transition-all duration-300 hover:bg-[#bbb] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed sm:w-full"
            >
              {isSubmitting ? 'SENDING...' : 'SUBMIT'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
