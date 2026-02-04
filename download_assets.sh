#!/bin/bash
mkdir -p music wallpapers

# Download Chamber Music
echo "Downloading music..."
curl -L -o music/chamber_music.mp3 "https://upload.wikimedia.org/wikipedia/commons/c/c4/Gymnopedie_No._1..ogg"

# Download Wallpapers
echo "Downloading wallpapers..."
curl -L -o wallpapers/wallpaper_1.jpg "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&q=80&w=1920"
curl -L -o wallpapers/wallpaper_2.jpg "https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&q=80&w=1920"
curl -L -o wallpapers/wallpaper_3.jpg "https://images.unsplash.com/photo-1515995301990-280d37b2a8c9?auto=format&fit=crop&q=80&w=1920"
curl -L -o wallpapers/wallpaper_4.jpg "https://images.unsplash.com/photo-1714384895745-c50ce042f394?auto=format&fit=crop&q=80&w=1920"
curl -L -o wallpapers/wallpaper_5.jpg "https://images.unsplash.com/photo-1639501252219-130096b7b904?auto=format&fit=crop&q=80&w=1920"
curl -L -o wallpapers/wallpaper_6.jpg "https://images.unsplash.com/photo-1546271876-af6caec5fae5?auto=format&fit=crop&q=80&w=1920"
curl -L -o wallpapers/wallpaper_7.jpg "https://images.unsplash.com/photo-1703934915711-439a6d16a1f3?auto=format&fit=crop&q=80&w=1920"
curl -L -o wallpapers/wallpaper_8.jpg "https://images.unsplash.com/photo-1482329833197-916d32bdae74?auto=format&fit=crop&q=80&w=1920"
curl -L -o wallpapers/wallpaper_9.jpg "https://images.unsplash.com/photo-1577794448376-3e5636dda79a?auto=format&fit=crop&q=80&w=1920"
curl -L -o wallpapers/wallpaper_10.jpg "https://images.unsplash.com/photo-1700909591006-a78674596074?auto=format&fit=crop&q=80&w=1920"

echo "Download complete!"
