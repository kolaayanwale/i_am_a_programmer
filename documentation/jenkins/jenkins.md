## generate-ascii
### Build steps - shell script
```
# Build a message by invoking ADVICESLIP API
curl -s https://api.adviceslip.com/advice > advice.json
cat advice.json

# Test to make sure the advice message has more than 3 words.
cat advice.json | jq -r .slip.advice > advice.message
[ $(wc -w < advice.message) -gt 3 ] && echo "Advice has more than 3 words" || (echo "Advice - $(cat advice.message) has 3 words or less" && exit 1)

# Deploy
sudo dnf install cowsay -y
cat advice.message | cowsay -f $(ls /usr/share/cowsay/ | shuf -n 1)
```