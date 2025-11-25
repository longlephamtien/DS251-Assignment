import React from 'react';
import Icon from '../common/Icon';

export default function QuickLinks() {
  const links = [
    {
      id: 1,
      title: 'CGV Cineplex',
      subtitle: 'Rạp CGV',
      icon: 'building',
      link: '/theaters/cgv-cineplex'
    },
    {
      id: 2,
      title: 'Now Showing',
      subtitle: 'Phim đang chiếu',
      icon: 'film',
      link: '/movies/now-showing'
    },
    {
      id: 3,
      title: 'CGV Special',
      subtitle: 'Sự kiện CGV',
      icon: 'ticket',
      link: '/events/special'
    },
    {
      id: 4,
      title: 'Group Sale',
      subtitle: 'Thuê rạp & bán vé nhóm',
      icon: 'user',
      link: '/services/group-sale'
    },
    {
      id: 5,
      title: 'Contact CGV',
      subtitle: 'Liên hệ CGV',
      icon: 'phone',
      link: '/contact'
    },
    {
      id: 6,
      title: 'News & Offers',
      subtitle: 'Ưu đãi & Tin tức',
      icon: 'email',
      link: '/news'
    },
    {
      id: 7,
      title: 'Register Now',
      subtitle: 'Đăng ký ngay!',
      icon: 'search',
      link: '/register'
    }
  ];

  return (
    <div className="bg-white border-b-2 border-red-600">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.link}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center mb-2 group-hover:border-red-600 group-hover:shadow-lg transition-all">
                <Icon name={link.icon} className="w-8 h-8 md:w-10 md:h-10 text-gray-700 group-hover:text-red-600 transition-colors" />
              </div>
              <div className="text-xs md:text-sm">
                <p className="font-bold text-gray-800 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                  {link.title}
                </p>
                <p className="text-gray-500 text-[10px] md:text-xs mt-0.5">
                  {link.subtitle}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
