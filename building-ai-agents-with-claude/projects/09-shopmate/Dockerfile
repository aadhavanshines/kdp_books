# ShopMate in a container: one image runs the daily brief and the dashboard.
FROM python:3.12-slim

# A normal user, not root: if the agent misbehaves, it can do less damage.
RUN useradd --create-home shopmate
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=shopmate:shopmate . .
# WORKDIR made /app as root; give it to shopmate so it can write out/.
RUN chown shopmate:shopmate /app
USER shopmate

# The API key comes from the environment at run time, never from the image.
ENV SHOPMATE_DATA=/app/data SHOPMATE_OUT=/app/out
EXPOSE 8000
# Default: the dashboard. The scheduler runs `python run_daily.py`
# in the same image.
CMD ["uvicorn", "ops:app", "--host", "0.0.0.0", "--port", "8000"]
