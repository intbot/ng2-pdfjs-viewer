#Depending on the operating system of the host machines(s) that will build or run the containers, the image specified in the FROM statement may need to be changed.
#For more information, please see https://aka.ms/containercompat

FROM microsoft/dotnet:2.1-aspnetcore-runtime-nanoserver-1803 AS base
WORKDIR /app
EXPOSE 80

FROM microsoft/dotnet:2.1-sdk-nanoserver-1803 AS build
WORKDIR /src
COPY ["Ng2PdfJsViewerDemo.csproj", ""]
RUN dotnet restore "/Ng2PdfJsViewerDemo.csproj"
COPY . .
WORKDIR "/src/"
RUN dotnet build "Ng2PdfJsViewerDemo.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "Ng2PdfJsViewerDemo.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
# ENTRYPOINT ["dotnet", "Ng2PdfJsViewerDemo.dll"]
# heroku uses the following
CMD ASPNETCORE_URLS=http://*:$PORT dotnet Ng2PdfJsViewerDemo.dll
