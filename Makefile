.PHONY: app service

app:
	cd app; yarn dev

service:
	uvicorn urban_heat.main:app --reload

country-add:
	python -m urban_heat.tasks.add_country $(code)

country-collect:
	python -m urban_heat.tasks.collect_country $(code)

country-process:
	python -m urban_heat.tasks.process_country $(code)

download:
	python -m urban_heat.tasks.download

upload:
	python -m urban_heat.tasks.upload
