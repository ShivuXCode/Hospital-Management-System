#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../public/assets/doctors" || exit 1

male_bases=(
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop'
  'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=400&fit=crop'
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop'
  'https://images.unsplash.com/photo-1551601651-4f4b7a3f11b8?w=400&h=400&fit=crop'
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop'
)
female_bases=(
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
  'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=400&h=400&fit=crop'
  'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&h=400&fit=crop'
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=400&fit=crop'
  'https://images.unsplash.com/photo-1551601651-4f4b7a3f11b8?w=400&h=400&fit=crop'
)

variants=4
n=1
for base in "${male_bases[@]}"; do
  for ((v=0; v<variants; v++)); do
    url="${base}&sig=$(( (n-1) ))"
    fname="male-doctor${n}.jpg"
    echo "Downloading $fname from $url"
    curl -sL "$url" -o "$fname" || { echo "FAILED $fname" >&2; }
    n=$((n+1))
  done
done

n=1
for base in "${female_bases[@]}"; do
  for ((v=0; v<variants; v++)); do
    url="${base}&sig=$(( (n-1) ))"
    fname="female-doctor${n}.jpg"
    echo "Downloading $fname from $url"
    curl -sL "$url" -o "$fname" || { echo "FAILED $fname" >&2; }
    n=$((n+1))
  done
done

# neutral
curl -sL 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop' -o neutral-doctor.png || true

echo "Done. Verify files in public/assets/doctors/"
