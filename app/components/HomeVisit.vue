<script setup>
// 這裡可以換成你的 Google Maps Embed URL
// 請注意：這是一個 iframe 連結，不需要 API Key
// const mapSrc = 'https://www.google.com/maps/embed?pb=!4v1767843578308!6m8!1m7!1sbKN7x2oEJnRdS6wHGUjQHg!2m2!1d23.97786236353652!2d121.5976279927802!3f109.88437695247089!4f-7.3006651239882245!5f0.7820865974627469'
const mapSrc = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3645.5078061025047!2d121.5977277!3d23.9778389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x34689f9625e81495%3A0x8a4150c6f8532215!2zOTcw6Iqx6JOu57ij6Iqx6JOu5biC5bu65p6X6KGXNuiZnw!5e0!3m2!1szh-TW!2stw!4v1767844475014!5m2!1szh-TW!2stw'

const storeInfo = {
  address: '970花蓮縣花蓮市建林街6號',
  phone: '0912-407-147',
  hours: '週一至週日 11:00 - 19:00'
}
</script>

<template>
  <section class="py-16 bg-stone-100">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:grid md:grid-cols-2 gap-8 items-center">
        
        <div class="space-y-6 text-center md:text-left">
          <div class="space-y-2">
            <h2 class="text-3xl font-bold text-amber-900 tracking-wide">
              來找我們喝杯咖啡吧
            </h2>
            <p class="text-stone-600">
              Visit Us & Enjoy the Moment
            </p>
          </div>

          <div class="space-y-4 text-gray-700 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div class="flex items-start justify-center md:justify-start gap-3">
              <span class="text-2xl">📍</span>
              <div>
                <p class="font-bold text-amber-800">地址 Address</p>
                <p>{{ storeInfo.address }}</p>
              </div>
            </div>

            <div class="flex items-start justify-center md:justify-start gap-3">
              <span class="text-2xl">🕒</span>
              <div>
                <p class="font-bold text-amber-800">營業時間 Hours</p>
                <p>{{ storeInfo.hours }}</p>
              </div>
            </div>

            <div class="flex items-start justify-center md:justify-start gap-3">
              <span class="text-2xl">📞</span>
              <div>
                <p class="font-bold text-amber-800">電話 Phone</p>
                <p>{{ storeInfo.phone }}</p>
              </div>
            </div>
          </div>
          
          <div class="md:hidden">
            <a 
              href="https://maps.google.com" 
              target="_blank"
              class="inline-block w-full py-3 bg-amber-700 text-white rounded-lg font-bold hover:bg-amber-800 transition text-center"
            >
              開啟 Google 地圖導航
            </a>
          </div>
        </div>

        <div class="w-full h-80 md:h-96 bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-white">
          <iframe 
            :src="mapSrc"
            width="100%" 
            height="100%" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
            class="w-full h-full grayscale-[20%] hover:grayscale-0 transition duration-500"
          ></iframe>
        </div>

      </div>
    </div>
  </section>
</template>