%%script bash

python_ps=$(lsof -i :5001 | awk '/Python/ {print $2}')
echo "Killing python process with PID: $python_ps"
echo $python_ps | xargs kill -9