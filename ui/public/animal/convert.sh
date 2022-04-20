

for f in *.jpg ; do
  convert "$f" -resize 150x "$f"
done


