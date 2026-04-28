# ITD 1: Use Expo React Native for the mobile frontend

## The Problem

Which frontend platform should mystore use to provide a mobile product catalog for iOS and Android?

## Options Considered

1. Build separate native iOS and Android apps
2. **Use Expo React Native for the mobile frontend**
3. Build a web-only product catalog

## Rationale

Expo React Native provides a single mobile frontend codebase while still supporting native iOS and Android development flows. This matches mystore's current need for a focused mobile catalog without duplicating product UI and interaction logic across platforms.

## Notes

The app uses Expo Router, React Native, NativeWind, and localized UI helpers.
