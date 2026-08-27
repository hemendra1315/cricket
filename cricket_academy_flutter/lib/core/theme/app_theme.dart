import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.bgLight,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primaryLight,
        onPrimary: AppColors.primaryFgLight,
        surface: AppColors.surfaceLight,
        onSurface: AppColors.fgLight,
        error: AppColors.dangerLight,
        onError: AppColors.primaryFgLight,
      ),
      fontFamily: 'Manrope',
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, color: AppColors.fgLight),
        headlineMedium: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, color: AppColors.fgLight),
        titleMedium: TextStyle(fontFamily: 'IBM Plex Sans', color: AppColors.fgLight),
        bodyLarge: TextStyle(fontFamily: 'IBM Plex Sans', color: AppColors.fgLight),
        bodyMedium: TextStyle(fontFamily: 'IBM Plex Sans', color: AppColors.fgMutedLight),
        labelLarge: TextStyle(fontFamily: 'IBM Plex Mono', color: AppColors.fgLight),
      ),
      cardTheme: const CardThemeData(
        color: AppColors.surfaceLight,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          side: BorderSide(color: AppColors.borderSubtleLight),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bgDark,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primaryDark,
        onPrimary: AppColors.primaryFgDark,
        surface: AppColors.surfaceDark,
        onSurface: AppColors.fgDark,
        error: AppColors.dangerDark,
        onError: AppColors.primaryFgDark,
      ),
      fontFamily: 'Manrope',
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, color: AppColors.fgDark),
        headlineMedium: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, color: AppColors.fgDark),
        titleMedium: TextStyle(fontFamily: 'IBM Plex Sans', color: AppColors.fgDark),
        bodyLarge: TextStyle(fontFamily: 'IBM Plex Sans', color: AppColors.fgDark),
        bodyMedium: TextStyle(fontFamily: 'IBM Plex Sans', color: AppColors.fgMutedDark),
        labelLarge: TextStyle(fontFamily: 'IBM Plex Mono', color: AppColors.fgDark),
      ),
      cardTheme: const CardThemeData(
        color: AppColors.surfaceDark,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          side: BorderSide(color: AppColors.borderSubtleDark),
        ),
      ),
    );
  }
}
