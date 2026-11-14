import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CLOUDINARY_DUMP = 'C:/Users/Lenovo/.gemini/antigravity/brain/ffc760d5-7580-45f4-bb9d-38c8384e7ba9/scratch/cloudinary_all.json';

interface CloudinaryItem {
  id: string;
  url: string;
  format: string;
  created_at: string;
}

const rawData: CloudinaryItem[] = JSON.parse(fs.readFileSync(CLOUDINARY_DUMP, 'utf8'));
const urlMap = new Map<string, string>();
for (const item of rawData) {
  urlMap.set(item.id, item.url);
}

function getUrl(id: string): string {
  const url = urlMap.get(id);
  if (!url) {
    console.warn(`[WARN] Cloudinary id not found: ${id}`);
    return '';
  }
  return url;
}

// 1. Category mapping (slug -> Cloudinary URL)
const CATEGORY_MAP: Record<string, string> = {
  'lam-gom': getUrl('craftlocal/categories/Lam_gom'),
  'dieu-khac-da': getUrl('craftlocal/categories/Dieu_khac_da'),
  'den-long': getUrl('craftlocal/categories/Den_long'),
  'am-thuc-dia-phuong': getUrl('craftlocal/categories/Am_thuc_dia_phuong'),
  'ca-phe-thao-moc': getUrl('craftlocal/categories/Ca_phe_thao_moc'),
  'may-tre-dan': getUrl('craftlocal/categories/May_tre_dan'),
  'det-vai-tho-cam': getUrl('craftlocal/categories/Det_vai_tho_cam'),
  'son-mai-tranh-thu-cong': getUrl('craftlocal/categories/Son_mai_tranh_thu_cong'),
};

// 2. Workshop mapping (slug -> { cover: string, gallery: string[] })
const WORKSHOP_MAP: Record<string, { cover: string; gallery: string[] }> = {
  'trai-nghiem-lam-gom-thanh-ha': {
    cover: getUrl('craftlocal/categories/Tu_tay_nan_tao_hinh_va_trang_tri_san_pham_gom_truyen_thong_duoi_su_hu_jpg'),
    gallery: [
      getUrl('smarttravel/workshops/ws-1_img_1'),
      getUrl('smarttravel/workshops/ws-1_img_2'),
      getUrl('smarttravel/workshops/ws-1_img_3'),
    ],
  },
  'workshop-dieu-khac-da-non-nuoc': {
    cover: getUrl('craftlocal/categories/Kham_pha_nghe_thuat_dieu_khac_da_cam_thach_tai_lang_da_my_nghe_Non_Nuo'),
    gallery: [
      getUrl('smarttravel/workshops/ws-2_img_1'),
      getUrl('smarttravel/workshops/ws-2_img_2'),
      getUrl('smarttravel/workshops/ws-2_img_3'),
    ],
  },
  'trai-nghiem-lam-den-long-hoi-an': {
    cover: getUrl('craftlocal/categories/Lam_den_long_lua_cao_cap_voi_hoa_tiet_ve_tay'),
    gallery: [
      getUrl('smarttravel/workshops/ws-3_img_1'),
      getUrl('smarttravel/workshops/ws-3_img_2'),
      getUrl('smarttravel/workshops/ws-3_img_3'),
    ],
  },
  'lop-nau-an-lang-rau-tra-que': {
    cover: getUrl('craftlocal/categories/lang-rau-tra-que-12'),
    gallery: [
      getUrl('smarttravel/workshops/ws-4_img_1'),
      getUrl('smarttravel/workshops/ws-4_img_2'),
      getUrl('smarttravel/workshops/ws-4_img_3'),
    ],
  },
  'workshop-ca-phe-phin-va-thao-moc': {
    cover: getUrl('craftlocal/categories/Workshop_ca_phe_phin_va_thao_moc'),
    gallery: [
      getUrl('smarttravel/workshops/ws-5_img_1'),
      getUrl('smarttravel/workshops/ws-5_img_2'),
      getUrl('smarttravel/workshops/ws-5_img_3'),
    ],
  },
  'workshop-may-tre-dan-cam-thanh': {
    cover: getUrl('craftlocal/categories/Workshop_may_tre_dan_Cam_Thanh'),
    gallery: [
      getUrl('smarttravel/workshops/ws-6_img_1'),
      getUrl('smarttravel/workshops/ws-6_img_2'),
      getUrl('smarttravel/workshops/ws-6_img_3'),
    ],
  },
  'workshop-det-vai-va-tho-cam': {
    cover: getUrl('craftlocal/categories/Tim_hieu_nghe_thuat_det_tho_cam_truyen_thong_cua_dong_bao_mien_nui'),
    gallery: [
      getUrl('smarttravel/workshops/ws-7_img_1'),
      getUrl('smarttravel/workshops/ws-7_img_2'),
      getUrl('smarttravel/workshops/ws-7_img_3'),
    ],
  },
  'workshop-son-mai-va-tranh-thu-cong': {
    cover: getUrl('craftlocal/categories/Hoc_ky_thuat_son_mai_truyen_thong_Viet_Nam_tu_tay_tao_ra_tac_pham_son'),
    gallery: [
      getUrl('smarttravel/workshops/ws-8_img_1'),
      getUrl('smarttravel/workshops/ws-8_img_2'),
      getUrl('smarttravel/workshops/ws-8_img_3'),
    ],
  },
  'tour-am-thuc-bien-my-khe': {
    cover: getUrl('craftlocal/categories/Tour_am_thuc_bien_My_Khe'),
    gallery: [
      getUrl('smarttravel/workshops/ws-9_img_1'),
      getUrl('smarttravel/workshops/ws-9_img_2'),
      getUrl('smarttravel/workshops/ws-9_img_3'),
    ],
  },
  'trai-nghiem-van-hoa-ngu-hanh-son': {
    cover: getUrl('craftlocal/categories/Trai_nghiem_van_hoa_Ngu_Hanh_Son'),
    gallery: [
      getUrl('smarttravel/workshops/ws-10_img_1'),
      getUrl('smarttravel/workshops/ws-10_img_2'),
      getUrl('smarttravel/workshops/ws-10_img_3'),
    ],
  },
  'lop-banh-mi-viet-nam': {
    cover: getUrl('craftlocal/categories/Hoc_lam_banh_mi_Viet_Nam_tu_A_den_Z_voi_dau_bep_dia_phuong'),
    gallery: [
      getUrl('smarttravel/workshops/ws-11_img_1'),
      getUrl('smarttravel/workshops/ws-11_img_2'),
      getUrl('smarttravel/workshops/ws-11_img_3'),
    ],
  },
  'dan-thuyen-thung-cam-kim': {
    cover: getUrl('craftlocal/categories/Hoc_dan_thuyen_thung_truyen_thong_tai_lang_Cam_Kim'),
    gallery: [
      getUrl('smarttravel/workshops/ws-12_img_1'),
      getUrl('smarttravel/workshops/ws-12_img_2'),
      getUrl('smarttravel/workshops/ws-12_img_3'),
    ],
  },
  'gom-nghe-thuat-duong-dai': {
    cover: getUrl('craftlocal/categories/Ket_hop_ky_thuat_gom_truyen_thong_voi_phong_cach_nghe_thuat_duong_dai'),
    gallery: [
      getUrl('smarttravel/workshops/ws-13_img_1'),
      getUrl('smarttravel/workshops/ws-13_img_2'),
      getUrl('smarttravel/workshops/ws-13_img_3'),
    ],
  },
  'den-long-lua-cao-cap': {
    cover: getUrl('craftlocal/categories/Lam_den_long_lua_cao_cap_voi_hoa_tiet_ve_tay_mang_ve_lam_qua_luu_niem'),
    gallery: [
      getUrl('smarttravel/workshops/ws-14_img_1'),
      getUrl('smarttravel/workshops/ws-14_img_2'),
      getUrl('smarttravel/workshops/ws-14_img_3'),
    ],
  },
  'trai-nghiem-tra-dao-viet-nam': {
    cover: getUrl('craftlocal/categories/Trai_nghiem_tra_dao_Viet_Nam'),
    gallery: [
      getUrl('smarttravel/workshops/ws-15_img_1'),
      getUrl('smarttravel/workshops/ws-15_img_2'),
      getUrl('smarttravel/workshops/ws-15_img_3'),
    ],
  },
  'tac-tuong-phat-da-mini': {
    cover: getUrl('craftlocal/categories/qua_trinh_Tu_tay_tac_mot_buc_tuong_Phat_nho_tu_da_cam_thach_Non_Nuoc'),
    gallery: [
      getUrl('smarttravel/workshops/ws-16_img_1'),
      getUrl('smarttravel/workshops/ws-16_img_2'),
      getUrl('smarttravel/workshops/ws-16_img_3'),
    ],
  },
  'nau-pho-truyen-thong': {
    cover: getUrl('craftlocal/categories/Nau_pho_truyen_thong'),
    gallery: [
      getUrl('smarttravel/workshops/ws-17_img_1'),
      getUrl('smarttravel/workshops/ws-17_img_2'),
      getUrl('smarttravel/workshops/ws-17_img_3'),
    ],
  },
  'dan-gio-tre-an-bang': {
    cover: getUrl('craftlocal/categories/Dan_gio_tre_tai_lang_bien_An_Bang_ket_hop_tam_bien_va_trai_nghiem'),
    gallery: [
      getUrl('smarttravel/workshops/ws-18_img_1'),
      getUrl('smarttravel/workshops/ws-18_img_2'),
      getUrl('smarttravel/workshops/ws-18_img_3'),
    ],
  },
  've-tranh-pho-co-hoi-an': {
    cover: getUrl('craftlocal/products/Tranh_ve_pho_co'),
    gallery: [
      getUrl('craftlocal/categories/tranh_thu_cong'),
      getUrl('craftlocal/products/Tranh_son_mai_pho_co'),
      getUrl('craftlocal/hero/banner-khám-phá-workshop-văn-hóa'),
    ],
  },
  'workshop-nhuom-vai-tu-nhien-nam-o': {
    cover: getUrl('craftlocal/categories/Det_vai_tho_cam'),
    gallery: [
      getUrl('smarttravel/workshops/ws-7_img_1'),
      getUrl('smarttravel/workshops/ws-7_img_2'),
      getUrl('smarttravel/workshops/ws-7_img_3'),
    ],
  },
  'test-1794660277421': {
    cover: getUrl('craftlocal/hero/banner-khám-phá-workshop-văn-hóa'),
    gallery: [
      getUrl('smarttravel/workshops/ws-1_img_1'),
      getUrl('smarttravel/workshops/ws-1_img_2'),
      getUrl('smarttravel/workshops/ws-1_img_3'),
    ],
  },
};

// 3. Product mapping (slug -> { thumbnail: string, images: string[] })
const PRODUCT_MAP: Record<string, { thumbnail: string; images: string[] }> = {
  'bo-am-tra-gom-thanh-ha': {
    thumbnail: getUrl('craftlocal/products/Binh_gom_trang_tri'),
    images: [
      getUrl('craftlocal/products/Binh_gom_trang_tri'),
      getUrl('craftlocal/products/Ly_ca_phe_gom'),
      getUrl('craftlocal/products/Dia_gom_trang_tri'),
    ],
  },
  'tuong-da-my-nghe-non-nuoc': {
    thumbnail: getUrl('craftlocal/products/Tuong_da_my_nghe_Non_Nuoc'),
    images: [
      getUrl('craftlocal/products/Tuong_da_my_nghe_Non_Nuoc'),
      getUrl('craftlocal/products/Bo_co_vua_da'),
      getUrl('craftlocal/products/Chan_giay_da'),
    ],
  },
  'den-long-lua-hoi-an': {
    thumbnail: getUrl('craftlocal/products/Den_long_lua_Hoi_An'),
    images: [
      getUrl('craftlocal/products/Den_long_lua_Hoi_An'),
      getUrl('craftlocal/categories/Lam_den_long_lua_cao_cap_voi_hoa_tiet_ve_tay'),
    ],
  },
  'gio-tre-dan-cam-thanh': {
    thumbnail: getUrl('craftlocal/products/Gio_tre_dan_Cam_Thanh'),
    images: [
      getUrl('craftlocal/products/Gio_tre_dan_Cam_Thanh'),
      getUrl('craftlocal/products/Tui_may_tre'),
      getUrl('craftlocal/products/Khay_tre_phuc_vu'),
    ],
  },
  'khan-tho-cam-thu-cong': {
    thumbnail: getUrl('craftlocal/products/Khan_Choang_Tho_Cam'),
    images: [
      getUrl('craftlocal/products/Khan_Choang_Tho_Cam'),
      getUrl('craftlocal/products/Vi_tho_cam'),
      getUrl('craftlocal/products/Tui_vai_tho_cam'),
    ],
  },
  'tranh-son-mai-pho-co': {
    thumbnail: getUrl('craftlocal/products/Tranh_son_mai_pho_co'),
    images: [
      getUrl('craftlocal/products/Tranh_son_mai_pho_co'),
      getUrl('craftlocal/products/Hop_son_mai_trang_tri'),
      getUrl('craftlocal/products/Tranh_ve_pho_co'),
    ],
  },
  'hop-son-mai-trang-tri': {
    thumbnail: getUrl('craftlocal/products/Hop_son_mai_trang_tri'),
    images: [
      getUrl('craftlocal/products/Hop_son_mai_trang_tri'),
      getUrl('craftlocal/products/Tranh_son_mai_pho_co'),
    ],
  },
  'binh-gom-trang-tri': {
    thumbnail: getUrl('craftlocal/products/Binh_gom_trang_tri'),
    images: [
      getUrl('craftlocal/products/Binh_gom_trang_tri'),
      getUrl('craftlocal/products/Dia_gom_trang_tri'),
    ],
  },
  'ly-ca-phe-gom': {
    thumbnail: getUrl('craftlocal/products/Ly_ca_phe_gom'),
    images: [
      getUrl('craftlocal/products/Ly_ca_phe_gom'),
      getUrl('craftlocal/products/Binh_gom_trang_tri'),
    ],
  },
  'tui-may-tre': {
    thumbnail: getUrl('craftlocal/products/Tui_may_tre'),
    images: [
      getUrl('craftlocal/products/Tui_may_tre'),
      getUrl('craftlocal/products/Gio_tre_dan_Cam_Thanh'),
      getUrl('craftlocal/products/Vong_tay_tre'),
    ],
  },
  'khay-tre-phuc-vu': {
    thumbnail: getUrl('craftlocal/products/Khay_tre_phuc_vu'),
    images: [
      getUrl('craftlocal/products/Khay_tre_phuc_vu'),
      getUrl('craftlocal/products/Den_tre_trang_tri'),
      getUrl('craftlocal/products/Quat_tre_cam_tay'),
    ],
  },
  'den-tre-trang-tri': {
    thumbnail: getUrl('craftlocal/products/Den_tre_trang_tri'),
    images: [
      getUrl('craftlocal/products/Den_tre_trang_tri'),
      getUrl('craftlocal/products/Khay_tre_phuc_vu'),
    ],
  },
  'tuong-phat-da-nho': {
    thumbnail: getUrl('craftlocal/categories/qua_trinh_Tu_tay_tac_mot_buc_tuong_Phat_nho_tu_da_cam_thach_Non_Nuoc'),
    images: [
      getUrl('craftlocal/categories/qua_trinh_Tu_tay_tac_mot_buc_tuong_Phat_nho_tu_da_cam_thach_Non_Nuoc'),
      getUrl('craftlocal/products/Tuong_da_my_nghe_Non_Nuoc'),
      getUrl('craftlocal/products/Chan_giay_da'),
    ],
  },
  'tranh-ve-pho-co': {
    thumbnail: getUrl('craftlocal/products/Tranh_ve_pho_co'),
    images: [
      getUrl('craftlocal/products/Tranh_ve_pho_co'),
      getUrl('craftlocal/products/Tranh_son_mai_pho_co'),
    ],
  },
  'bo-gia-vi-thao-moc': {
    thumbnail: getUrl('craftlocal/products/Bo_gia_vi_thao_moc'),
    images: [
      getUrl('craftlocal/products/Bo_gia_vi_thao_moc'),
      getUrl('craftlocal/products/Tra_thao_moc_detox'),
      getUrl('craftlocal/products/Tuong_ot_Hoi_An'),
    ],
  },
  'ca-phe-rang-moc': {
    thumbnail: getUrl('craftlocal/products/Ca_phe_rang_moc'),
    images: [
      getUrl('craftlocal/products/Ca_phe_rang_moc'),
      getUrl('craftlocal/products/Ly_ca_phe_gom'),
      getUrl('craftlocal/products/Tra_thao_moc_detox'),
    ],
  },
  'non-la-trang-tri': {
    thumbnail: getUrl('craftlocal/products/Quat_tre_cam_tay'),
    images: [
      getUrl('craftlocal/products/Quat_tre_cam_tay'),
      getUrl('craftlocal/products/Den_tre_trang_tri'),
    ],
  },
  'vi-tho-cam': {
    thumbnail: getUrl('craftlocal/products/Vi_tho_cam'),
    images: [
      getUrl('craftlocal/products/Vi_tho_cam'),
      getUrl('craftlocal/products/Khan_Choang_Tho_Cam'),
      getUrl('craftlocal/products/Tui_vai_tho_cam'),
    ],
  },
  'vong-tay-tre': {
    thumbnail: getUrl('craftlocal/products/Vong_tay_tre'),
    images: [
      getUrl('craftlocal/products/Vong_tay_tre'),
      getUrl('craftlocal/products/Khay_tre_phuc_vu'),
      getUrl('craftlocal/products/Tui_may_tre'),
    ],
  },
  'bo-co-vua-da': {
    thumbnail: getUrl('craftlocal/products/Bo_co_vua_da'),
    images: [
      getUrl('craftlocal/products/Bo_co_vua_da'),
      getUrl('craftlocal/products/Chan_giay_da'),
      getUrl('craftlocal/products/Tuong_da_my_nghe_Non_Nuoc'),
    ],
  },
  'mam-ruoc-hoi-an': {
    thumbnail: getUrl('craftlocal/products/Mam_ruoc_Hoi_An'),
    images: [
      getUrl('craftlocal/products/Mam_ruoc_Hoi_An'),
      getUrl('craftlocal/products/Tuong_ot_Hoi_An'),
    ],
  },
  'tuong-ot-hoi-an': {
    thumbnail: getUrl('craftlocal/products/Tuong_ot_Hoi_An'),
    images: [
      getUrl('craftlocal/products/Tuong_ot_Hoi_An'),
      getUrl('craftlocal/products/Mam_ruoc_Hoi_An'),
      getUrl('craftlocal/products/Bo_gia_vi_thao_moc'),
    ],
  },
  'chen-gom-bo-6': {
    thumbnail: getUrl('craftlocal/products/Dia_gom_trang_tri'),
    images: [
      getUrl('craftlocal/products/Dia_gom_trang_tri'),
      getUrl('craftlocal/products/Ly_ca_phe_gom'),
      getUrl('craftlocal/products/Binh_gom_trang_tri'),
    ],
  },
  'den-long-keo-quan': {
    thumbnail: getUrl('craftlocal/products/Den_long_lua_Hoi_An'),
    images: [
      getUrl('craftlocal/products/Den_long_lua_Hoi_An'),
      getUrl('craftlocal/categories/Lam_den_long_lua_cao_cap_voi_hoa_tiet_ve_tay_mang_ve_lam_qua_luu_niem'),
    ],
  },
  'tra-thao-moc-detox': {
    thumbnail: getUrl('craftlocal/products/Tra_thao_moc_detox'),
    images: [
      getUrl('craftlocal/products/Tra_thao_moc_detox'),
      getUrl('craftlocal/products/Bo_gia_vi_thao_moc'),
      getUrl('craftlocal/products/Ca_phe_rang_moc'),
    ],
  },
  'chan-giay-da': {
    thumbnail: getUrl('craftlocal/products/Chan_giay_da'),
    images: [
      getUrl('craftlocal/products/Chan_giay_da'),
      getUrl('craftlocal/products/Bo_co_vua_da'),
      getUrl('craftlocal/products/Tuong_da_my_nghe_Non_Nuoc'),
    ],
  },
  'quat-tre-cam-tay': {
    thumbnail: getUrl('craftlocal/products/Quat_tre_cam_tay'),
    images: [
      getUrl('craftlocal/products/Quat_tre_cam_tay'),
      getUrl('craftlocal/products/Khay_tre_phuc_vu'),
      getUrl('craftlocal/products/Vong_tay_tre'),
    ],
  },
  'dia-gom-trang-tri': {
    thumbnail: getUrl('craftlocal/products/Dia_gom_trang_tri'),
    images: [
      getUrl('craftlocal/products/Dia_gom_trang_tri'),
      getUrl('craftlocal/products/Binh_gom_trang_tri'),
      getUrl('craftlocal/products/Ly_ca_phe_gom'),
    ],
  },
  'tui-vai-tho-cam': {
    thumbnail: getUrl('craftlocal/products/Tui_vai_tho_cam'),
    images: [
      getUrl('craftlocal/products/Tui_vai_tho_cam'),
      getUrl('craftlocal/products/Khan_Choang_Tho_Cam'),
      getUrl('craftlocal/products/Vi_tho_cam'),
    ],
  },
  'tinh-dau-sa-chanh': {
    thumbnail: getUrl('craftlocal/products/Bo_gia_vi_thao_moc'),
    images: [
      getUrl('craftlocal/products/Bo_gia_vi_thao_moc'),
      getUrl('craftlocal/products/Tra_thao_moc_detox'),
    ],
  },
  'tra-1794487122600': {
    thumbnail: getUrl('craftlocal/products/Tra_thao_moc_detox'),
    images: [
      getUrl('craftlocal/products/Tra_thao_moc_detox'),
      getUrl('craftlocal/products/Ca_phe_rang_moc'),
    ],
  },
};

async function syncAll() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in backend/.env');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db!;

  // 1. Update Categories
  console.log('\n--- Syncing Categories ---');
  let catUpdated = 0;
  for (const [slug, imgUrl] of Object.entries(CATEGORY_MAP)) {
    if (!imgUrl) continue;
    const res = await db.collection('categories').updateOne(
      { slug },
      { $set: { image: imgUrl, thumbnail: imgUrl } }
    );
    if (res.matchedCount > 0) {
      catUpdated++;
      console.log(`[Category OK] ${slug} -> ${imgUrl}`);
    } else {
      console.log(`[Category SKIP/NOT_FOUND] ${slug}`);
    }
  }
  console.log(`Updated ${catUpdated} categories.`);

  // 2. Update Workshops
  console.log('\n--- Syncing Workshops ---');
  let wsUpdated = 0;
  for (const [slug, data] of Object.entries(WORKSHOP_MAP)) {
    const images = [data.cover, ...data.gallery].filter(Boolean);
    const thumbnail = data.cover;
    const res = await db.collection('workshops').updateOne(
      { slug },
      { $set: { thumbnail, images } }
    );
    if (res.matchedCount > 0) {
      wsUpdated++;
      console.log(`[Workshop OK] ${slug} (${images.length} images)`);
    } else {
      console.log(`[Workshop SKIP/NOT_FOUND] ${slug}`);
    }
  }
  console.log(`Updated ${wsUpdated} workshops.`);

  // 3. Update Products
  console.log('\n--- Syncing Products ---');
  let prodUpdated = 0;
  for (const [slug, data] of Object.entries(PRODUCT_MAP)) {
    const images = data.images.filter(Boolean);
    const thumbnail = data.thumbnail;
    const res = await db.collection('products').updateOne(
      { slug },
      { $set: { thumbnail, images } }
    );
    if (res.matchedCount > 0) {
      prodUpdated++;
      console.log(`[Product OK] ${slug} (${images.length} images)`);
    } else {
      console.log(`[Product SKIP/NOT_FOUND] ${slug}`);
    }
  }
  console.log(`Updated ${prodUpdated} products.`);

  await mongoose.disconnect();
  console.log('\nFinished sync successfully!');
}

syncAll().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
