import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/user.model";
import Category from "../models/category.model";
import Workshop from "../models/workshop.model";
import Timeslot from "../models/timeslot.model";
import Booking from "../models/booking.model";
import Ticket from "../models/ticket.model";
import Product from "../models/product.model";
import Order from "../models/order.model";
import Payment from "../models/payment.model";
import Review from "../models/review.model";
import Wishlist from "../models/wishlist.model";
import Cart from "../models/cart.model";
import Notification from "../models/notification.model";
import AuditLog from "../models/auditLog.model";

import { usersData } from "./data/users";
import { categoriesData } from "./data/categories";
import { workshopsData } from "./data/workshops";
import { timeslotsData } from "./data/timeslots";
import { productsData } from "./data/products";
import {
  bookingsData,
  ticketsData,
  ordersData,
  paymentsData,
  reviewsData,
  wishlistsData,
  cartsData,
  notificationsData,
  auditLogsData,
} from "./data/transactions";

const seed = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected for seeding");

    // Xóa dữ liệu và indexes cũ
    const collections = await mongoose.connection
      .db!.listCollections()
      .toArray();
    for (const col of collections) {
      await mongoose.connection.db!.dropCollection(col.name).catch(() => {});
    }
    console.log("🗑️  Dropped all collections");

    // Insert theo thứ tự
    await User.insertMany(usersData);
    console.log(`👤 Users: ${usersData.length}`);

    await Category.insertMany(categoriesData);
    console.log(`📁 Categories: ${categoriesData.length}`);

    await Workshop.insertMany(workshopsData);
    console.log(`🏺 Workshops: ${workshopsData.length}`);

    await Timeslot.insertMany(timeslotsData);
    console.log(`🕐 Timeslots: ${timeslotsData.length}`);

    await Product.insertMany(productsData);
    console.log(`🛍️  Products: ${productsData.length}`);

    await Payment.insertMany(paymentsData);
    console.log(`💳 Payments: ${paymentsData.length}`);

    await Booking.insertMany(bookingsData);
    console.log(`📋 Bookings: ${bookingsData.length}`);

    await Ticket.insertMany(ticketsData);
    console.log(`🎫 Tickets: ${ticketsData.length}`);

    await Order.insertMany(ordersData);
    console.log(`📦 Orders: ${ordersData.length}`);

    await Review.insertMany(reviewsData);
    console.log(`⭐ Reviews: ${reviewsData.length}`);

    await Wishlist.insertMany(wishlistsData);
    console.log(`❤️  Wishlists: ${wishlistsData.length}`);

    await Cart.insertMany(cartsData);
    console.log(`🛒 Carts: ${cartsData.length}`);

    await Notification.insertMany(notificationsData);
    console.log(`🔔 Notifications: ${notificationsData.length}`);

    await AuditLog.insertMany(auditLogsData);
    console.log(`📝 AuditLogs: ${auditLogsData.length}`);

    console.log("\n✅ SEED COMPLETED SUCCESSFULLY!\n");
    console.log("📋 Tài khoản demo:");
    console.log("  Admin:     admin@gmail.com / 123456");
    console.log("  Host 1-6:  host1@gmail.com ... host6@gmail.com / 123456");
    console.log("  Guide 1-6: guide1@gmail.com ... guide6@gmail.com / 123456");
    console.log(
      "  Tourist 1-10: tourist1@gmail.com ... tourist10@gmail.com / 123456",
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();
